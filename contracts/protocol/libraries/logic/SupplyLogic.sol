// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.10;

import {IWFIL} from '../../../interfaces/IWFIL.sol';
import {IsFIL} from '../../../interfaces/IsFIL.sol';

import {DataTypes} from '../types/DataTypes.sol';
import {ReserveLogic} from './ReserveLogic.sol';
import {ValidationLogic} from './ValidationLogic.sol';

/**
 * @title SupplyLogic library
 * @notice Implements the base logic for supply/withdraw
 */
library SupplyLogic {

  using ReserveLogic for DataTypes.ReserveData;


  /**
   * @notice Implements the supply feature. Through `underwrite()`, users borrow assets from the protocol.
   * @dev In the first supply action, `ReserveUsedAsCollateralEnabled()` is emitted, if the asset can be enabled as
   * collateral.
   * @param reservesData The state of all the reserves
   * @param params The additional parameters needed to execute the supply function
   */
  function executeUnderwrite(
    mapping(address => DataTypes.ReserveData) storage reservesData,
    DataTypes.ExecuteUnderwriteParams memory params
  ) internal {

    DataTypes.ReserveData storage reserve = reservesData[params.asset];
    reserve.updateState();

    ValidationLogic.validateUnderwrite(params.asset, params.amount, params.owner);

    IsFIL(reserve.sFILAddress).borrow(params.owner, params.amount);

  }

  /**
   * @notice Implements the supply feature. Through `supply()`, users supply assets to the protocol.
   * @dev In the first supply action, `ReserveUsedAsCollateralEnabled()` is emitted, if the asset can be enabled as
   * collateral.
   * @param reservesData The state of all the reserves
   * @param params The additional parameters needed to execute the supply function
   */
  function executeSupply(
    mapping(address => DataTypes.ReserveData) storage reservesData,
    DataTypes.ExecuteSupplyParams memory params
  ) internal {

    DataTypes.ReserveData storage reserve = reservesData[params.asset];
    reserve.updateState();

    ValidationLogic.validateSupply(params.amount);

    IWFIL(params.asset).transferFrom(params.from, reserve.sFILAddress, params.amount);

    IsFIL(reserve.sFILAddress).mint(msg.sender, params.onBehalfOf, params.amount);

  }

/**
   * @notice Implements the withdraw feature. Through `withdraw()`, users redeem their sFILs for the underlying asset
   * previously supplied in the protocol.
   * @param reservesData The state of all the reserves
   * @param params The additional parameters needed to execute the withdraw function
   * @return The actual amount withdrawn
   */
  function executeWithdraw(
    mapping(address => DataTypes.ReserveData) storage reservesData,
    DataTypes.ExecuteWithdrawParams memory params
  ) internal returns (uint256) {

    DataTypes.ReserveData storage reserve = reservesData[params.asset];
    reserve.updateState();

    uint256 userBalance = IsFIL(reserve.sFILAddress).balanceOf(msg.sender);

    uint256 amountToWithdraw = params.amount;

    if (params.amount == type(uint256).max) {
      amountToWithdraw = userBalance;
    }

    ValidationLogic.validateWithdraw(amountToWithdraw, userBalance);

    IsFIL(reserve.sFILAddress).burn(msg.sender, amountToWithdraw);

    IWFIL(reserve.sFILAddress).transferFrom(reserve.sFILAddress, params.to, amountToWithdraw);

    return amountToWithdraw;
  }

}