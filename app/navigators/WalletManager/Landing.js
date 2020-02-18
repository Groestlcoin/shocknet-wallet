import React from 'react'

/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import * as API from '../../services/contact-api'
import * as Auth from '../../services/auth'
import * as Wallet from '../../services/wallet'

import * as Cache from '../../services/cache'
import { LOGIN } from '../../screens/Login'
import { APP } from '../Root'

import { CREATE_WALLET_OR_ALIAS } from './CreateWalletOrAlias'
import OnboardingScreen from '../../components/OnboardingScreen'
import { CONNECT_TO_NODE } from '../../screens/ConnectToNode'

export const LANDING = 'LANDING'

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 */

/**
 * @augments React.PureComponent<Props, {}>
 */
export default class CreateWallet extends React.PureComponent {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  didFocus = {
    remove() {},
  }

  componentDidMount() {
    this.didFocus = this.props.navigation.addListener('didFocus', this.setup)
  }

  componentWillUnmount() {
    this.didFocus.remove()
  }

  setup = async () => {
    try {
      console.warn('GETTING AUTH DATA')
      const authData = await Cache.getStoredAuthData()
      console.warn('GETTING WALLET STATUS')
      const walletStatus = await Wallet.walletStatus()
      console.warn('GETTING IS_GUN_AUTH')
      const isGunAuth = await Auth.isGunAuthed()

      if (walletStatus === 'noncreated') {
        console.warn('WALLET NON CREATED INVALIDATING CACHED AUTH DATA')
        await Cache.writeStoredAuthData(null)
        console.warn('NAVIGATING TO CREATE WALLET OR ALIAS SCREEN')
        this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
      }

      if (walletStatus === 'unlocked') {
        if (authData !== null && isGunAuth) {
          console.warn(
            'NOW CONNECTING SOCKET, GUN IS AUTHED AND AUTH DATA IS CACHED',
          )
          await API.Socket.connect()
          console.warn('NAVIGATING TO APP')
          this.props.navigation.navigate(APP)
        } else {
          console.warn(
            'NO AUTH DATA CACHED OR GUN IS NOT AUTH, NAVIGATING TO LOGIN',
          )
          this.props.navigation.navigate(LOGIN)
        }
      }

      if (walletStatus === 'locked') {
        console.warn('WALLET IS LOCKED')
        if (authData === null) {
          console.warn(
            'WALLET LOCKED AND NO CACHED AUTH, NAVIGATING TO CREATE WALLET OR ALIAS',
          )
          this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
        } else {
          console.warn(
            'WALLET LOCKED BUT GOT CACHED AUTH DATA, NAVIGATING TO LOGIN',
          )
          this.props.navigation.navigate(LOGIN)
        }
      }
    } catch (e) {
      console.warn(
        'ERROR IN Landing.setup: ' +
          e.message +
          ' -- will navigate to CONNECT SCREEN, with error paramater',
      )
      this.props.navigation.navigate(CONNECT_TO_NODE, {
        err: e.message,
      })
    }
  }

  onPressCreate = () => {
    this.props.navigation.navigate(CREATE_WALLET_OR_ALIAS)
  }

  onPressUnlock = () => {
    this.props.navigation.navigate(LOGIN)
  }

  render() {
    return <OnboardingScreen loading />
  }
}
