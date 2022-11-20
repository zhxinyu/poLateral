// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.10;

import {DataTypes} from '../protocol/libraries/types/DataTypes.sol';

/**
 * @title IPool
 * @notice Defines the basic interface for an FIL Lending Pool.
 **/
 interface IPool{

  /**
   * @dev Emitted on supply()
   * @param reserve The address of the underlying asset of the reserve
   * @param user The address initiating the supply
   * @param onBehalfOf The beneficiary of the supply, receiving the sFILs
   * @param amount The amount supplied
   **/
  event Supply(
    address indexed reserve,
    address user,
    address indexed onBehalfOf,
    uint256 amount
  );


  /**
   * @dev Emitted on withdraw()
   * @param reserve The address of the underlying asset being withdrawn
   * @param user The address initiating the withdrawal, owner of sFILs
   * @param to The address that will receive the underlying
   * @param amount The amount to be withdrawn
   **/
  event Withdraw(address indexed reserve, address indexed user, address indexed to, uint256 amount);

  /**
   * @dev Emitted on borrow() when debt needs to be opened
   * @param reserve The address of the underlying asset being borrowed
   * @param user The address of the user initiating the borrow(), receiving the funds on borrow()
   * @param onBehalfOf The address that will be getting the debt
   * @param amount The amount borrowed out
   * @param interestRateMode The rate mode: 1 for Stable, 2 for Variable
   * @param borrowRate The numeric rate at which the user has borrowed
   **/
  event Borrow(
    address indexed reserve,
    address user,
    address indexed onBehalfOf,
    uint256 amount,
    DataTypes.InterestRateMode interestRateMode,
    uint256 borrowRate
  );

  /**
   * @dev Emitted on repay()
   * @param reserve The address of the underlying asset of the reserve
   * @param user The beneficiary of the repayment, getting his debt reduced
   * @param repayer The address of the user initiating the repay(), providing the funds
   * @param amount The amount repaid
   * @param useATokens True if the repayment is done using sFILs, `false` if done with underlying asset directly
   **/
  event Repay(
    address indexed reserve,
    address indexed user,
    address indexed repayer,
    uint256 amount,
    bool useATokens
  );

  /**
   * @dev Emitted when a borrower is liquidated.
   * @param collateralAsset The address of the underlying asset used as collateral, to receive as result of the liquidation
   * @param debtAsset The address of the underlying borrowed asset to be repaid with the liquidation
   * @param user The address of the borrower getting liquidated
   * @param debtToCover The debt amount of borrowed `asset` the liquidator wants to cover
   * @param liquidatedCollateralAmount The amount of collateral received by the liquidator
   * @param liquidator The address of the liquidator
   * @param receiveAToken True if the liquidators wants to receive the collateral aTokens, `false` if he wants
   * to receive the underlying collateral asset directly
   **/
  event LiquidationCall(
    address indexed collateralAsset,
    address indexed debtAsset,
    address indexed user,
    uint256 debtToCover,
    uint256 liquidatedCollateralAmount,
    address liquidator,
    bool receiveAToken
  );

  /**
   * @notice Supplies an `amount` of underlying asset FIL into the reserve, receiving in return overlying aFIL.
   * - E.g. User supplies 100 FIL and gets in return 100 aFIL
   * @param asset The address of the underlying asset to supply
   * @param amount The amount to be supplied
   * @param onBehalfOf The address that will receive the aFIL, same as msg.sender if the user
   *   wants to receive them on his own wallet, or a different address if the beneficiary of aFIL
   *   is a different wallet
   **/
  function supply(
    address asset,
    uint256 amount,
    address onBehalfOf
  ) external;

  /**
   * @notice Withdraws an `amount` of underlying asset from the reserve, burning the equivalent aTokens owned
   * E.g. User has 100 aFIL, calls withdraw() and receives 100 FIL, burning the 100 aFIL
   * @param asset The address of the underlying asset to withdraw
   * @param amount The underlying amount to be withdrawn
   *   - Send the value type(uint256).max in order to withdraw the whole aToken balance
   * @param to The address that will receive the underlying, same as msg.sender if the user
   *   wants to receive it on his own wallet, or a different address if the beneficiary is a
   *   different wallet
   * @return The final amount withdrawn
   **/
  function withdraw(
    address asset,
    uint256 amount,
    address to
  ) external returns (uint256);

  // /**
  //  * @notice Allows users to borrow a specific `amount` of the reserve underlying asset, provided that the borrower
  //  * already supplied enough collateral, or he was given enough allowance by a credit delegator on the
  //  * corresponding debt token (StableDebtToken or VariableDebtToken)
  //  * - E.g. User borrows 100 USDC passing as `onBehalfOf` his own address, receiving the 100 USDC in his wallet
  //  *   and 100 stable/variable debt tokens, depending on the `interestRateMode`
  //  * @param asset The address of the underlying asset to borrow
  //  * @param amount The amount to be borrowed
  //  * @param interestRateMode The interest rate mode at which the user wants to borrow: 1 for Stable, 2 for Variable
  //  * @param onBehalfOf The address of the user who will receive the debt. Should be the address of the borrower itself
  //  * calling the function if he wants to borrow against his own collateral, or the address of the credit delegator
  //  * if he has been given credit delegation allowance
  //  **/
  // function borrow(
  //   address asset,
  //   uint256 amount,
  //   uint256 interestRateMode,
  //   address onBehalfOf
  // ) external;

  // /**
  //  * @notice Repays a borrowed `amount` on a specific reserve, burning the equivalent debt tokens owned
  //  * - E.g. User repays 100 USDC, burning 100 variable/stable debt tokens of the `onBehalfOf` address
  //  * @param asset The address of the borrowed underlying asset previously borrowed
  //  * @param amount The amount to repay
  //  * - Send the value type(uint256).max in order to repay the whole debt for `asset` on the specific `debtMode`
  //  * @param interestRateMode The interest rate mode at of the debt the user wants to repay: 1 for Stable, 2 for Variable
  //  * @param onBehalfOf The address of the user who will get his debt reduced/removed. Should be the address of the
  //  * user calling the function if he wants to reduce/remove his own debt, or the address of any other
  //  * other borrower whose debt should be removed
  //  * @return The final amount repaid
  //  **/
  // function repay(
  //   address asset,
  //   uint256 amount,
  //   uint256 interestRateMode,
  //   address onBehalfOf
  // ) external returns (uint256);

  // /**
  //  * @notice Function to liquidate a non-healthy position collateral-wise, with Health Factor below 1
  //  * - The caller (liquidator) covers `debtToCover` amount of debt of the user getting liquidated, and receives
  //  *   a proportionally amount of the `collateralAsset` plus a bonus to cover market risk
  //  * @param collateralAsset The address of the underlying asset used as collateral, to receive as result of the liquidation
  //  * @param debtAsset The address of the underlying borrowed asset to be repaid with the liquidation
  //  * @param user The address of the borrower getting liquidated
  //  * @param debtToCover The debt amount of borrowed `asset` the liquidator wants to cover
  //  * @param receiveAToken True if the liquidators wants to receive the collateral aTokens, `false` if he wants
  //  * to receive the underlying collateral asset directly
  //  **/
  // function liquidationCall(
  //   address collateralAsset,
  //   address debtAsset,
  //   address user,
  //   uint256 debtToCover,
  //   bool receiveAToken
  // ) external;

  // /**
  //  * @notice Returns the list of the underlying assets of all the initialized reserves
  //  * @dev It does not include dropped reserves
  //  * @return The addresses of the underlying assets of the initialized reserves
  //  **/
  // function getReserves() external view returns (address);

  // /**
  //  * @notice Rescue and transfer tokens locked in this contract
  //  * @param token The address of the token
  //  * @param to The address of the recipient
  //  * @param amount The amount of token to transfer
  //  */
  // function rescueTokens(
  //   address token,
  //   address to,
  //   uint256 amount
  // ) external;
  
 }