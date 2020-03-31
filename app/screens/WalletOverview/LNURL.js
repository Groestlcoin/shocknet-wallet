import React from 'react'
import Logger from 'react-native-file-log'
import ShockModal from '../../components/ShockModal'
import { Text, View, Switch, StyleSheet, ToastAndroid } from 'react-native'
import { nodeInfo, addPeer, addInvoice } from '../../services/wallet'
import ShockButton from '../../components/ShockButton'
import ShockInput from '../../components/ShockInput'
import Pad from '../../components/Pad'
import * as CSS from '../../res/css'

/**@typedef {{  tag:string,
 *              uri:string,
 *              metadata:string,
 *              callback:string,
 *              minSendable:number,
 *              maxSendable:number,
 *              maxWithdrawable:number,
 *              shockPubKey:string,
 *          }} LNURLdataType */
export default class LNURL extends React.Component {
  /**@param {object} props */
  constructor(props) {
    super(props)

    this.state = this.getInitialLNURLState()
  }

  localReset = () => {
    this.props.refreshLNURL()
    this.setState(this.getInitialLNURLState())
  }

  getInitialLNURLState = () => {
    return {
      privateChannel: true,
      done: null,
      error: null,
      payAmount: 0,
      withdrawAmount: 0,
      didChange: false,
      hasMemo: false,
      memo: '',
    }
  }

  /**@param {string} text */
  setWithdrawAmount = text => {
    this.setState({
      withdrawAmount: Number(text),
      didChange: true,
    })
  }

  /**@param {string} text */
  setPayAmount = text => {
    this.setState({
      payAmount: Number(text),
      didChange: true,
    })
  }

  /**@param {boolean} bool*/
  setPrivate = bool => {
    this.setState({
      privateChannel: bool,
    })
  }

  /**@param {boolean} bool*/
  setHasMemo = bool => {
    this.setState({
      hasMemo: bool,
    })
  }

  /**@param {string} text */
  setMemo = text => {
    this.setState({
      memo: text,
    })
  }

  /**
   * @const {string} callback
   * @const {string} k1
   * @const {string} nodeId
   * @const {boolean} privateChan
   */
  confirmChannelReq = async () => {
    const { uri, callback, k1 } = this.props.LNURLdata
    let newK1 = k1
    if (k1 === 'gun' && this.props.LNURLdata.shockPubKey) {
      newK1 = `$$__SHOCKWALLET__USER__${this.props.LNURLdata.shockPubKey}`
    }
    try {
      await addPeer(uri)
    } catch (e) {
      Logger.log(e)
      ToastAndroid.show(e.toString(), 800)
    }
    try {
      const node = await nodeInfo()
      //Logger.log(node)

      const nodeId = node.identity_pubkey
      const priv = this.state.privateChannel ? 1 : 0
      const completeUrl = `${callback}?k1=${newK1}&remoteid=${nodeId}&private=${priv}`
      Logger.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      Logger.log(json)
      if (json.status === 'OK') {
        this.setState({
          done: 'Channel request sent correctly',
        })
      } else {
        this.setState({
          error: json.reason,
        })
      }
    } catch (e) {
      Logger.log(e)
      this.setState({
        error: e.toString(),
      })
    }
  }

  confirmPayReq = async () => {
    try {
      const { callback } = this.props.LNURLdata
      const { payAmount } = this.state
      const completeUrl = `${callback}?amount=${payAmount * 1000}`
      Logger.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      Logger.log(json)
      if (json.status === 'ERROR') {
        this.setState({
          error: json.reason,
        })
        return
      }
      Logger.log(json.pr)
      this.props.requestClose()
      this.props.payInvoice({ invoice: json.pr })
    } catch (e) {
      Logger.log(e)
      this.setState({
        error: e,
      })
    }
  }

  confirmWithdrawReq = async () => {
    try {
      const { callback, k1 } = this.props.LNURLdata
      const payReq = await addInvoice({
        value: this.state.withdrawAmount,
        memo: this.state.memo,
        expiry: 1800,
      })
      const completeUrl = `${callback}?k1=${k1}&pr=${payReq.payment_request}`
      Logger.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      Logger.log(json)
      if (json.status === 'OK') {
        this.setState({
          done: 'Withdraw request sent correctly',
        })
      } else {
        this.setState({
          error: json.reason,
        })
      }
    } catch (e) {
      this.setState({
        error: e,
      })
    }
  }

  handleDone() {
    return <Text>{this.state.done}</Text>
  }

  handleError() {
    return <Text>{this.state.error}</Text>
  }

  /**@param   {LNURLdataType} LNURLdata*/
  handleUrl = LNURLdata => {
    switch (LNURLdata.tag) {
      case 'channelRequest': {
        Logger.log('this url is a channel request')
        return this.renderChannelRequest(LNURLdata)
      }
      case 'withdrawRequest': {
        Logger.log('this url is a withdrawal request')
        return this.renderWithdraw(LNURLdata)
      }
      case 'hostedChannelRequest': {
        Logger.log('this url is a hosted channel request')
        return this.renderHostedChannelRequest()
      }
      case 'login': {
        Logger.log('this url is a login ')
        return this.renderAuth()
      }
      case 'payRequest': {
        Logger.log('this url is a pay request')
        return this.renderPay(LNURLdata)
      }
      default: {
        Logger.log('unknown tag')
        return this.renderUnknown()
      }
    }
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderChannelRequest = LNURLdata => {
    const { privateChannel } = this.state
    return (
      <View>
        <Text style={styles.bigBold}>LNURL Channel Request</Text>
        <Pad amount={10} />
        <Text style={styles.selfCenter}>Requesting channel from:</Text>
        <Text style={styles.centerBold}>
          {LNURLdata.uri ? LNURLdata.uri : 'ADDRESS NOT FOUND'}
        </Text>
        <View style={styles.switch}>
          <Text>Private Channel</Text>
          <Switch value={privateChannel} onValueChange={this.setPrivate} />
        </View>
        <Pad amount={10} />
        <ShockButton onPress={this.confirmChannelReq} title="CONNECT" />
      </View>
    )
  }

  renderHostedChannelRequest = () => {
    return (
      <Text>
        LNURL : Hosted Channel Request - This Request is not supported
      </Text>
    )
  }

  renderAuth = () => {
    return <Text>LNURL : Auth Request - This Request is not supported</Text>
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderWithdraw = LNURLdata => {
    const { withdrawAmount, didChange, hasMemo, memo } = this.state
    let withdrawal = withdrawAmount
    if (!didChange) {
      withdrawal = LNURLdata.maxWithdrawable / 1000
    }
    return (
      <View>
        <Text style={styles.bigBold}>LNURL Withdraw Request </Text>
        <Pad amount={10} />
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>Max</Text> Withdrawable:
        </Text>
        <Text style={styles.selfCenter}>
          {' '}
          <Text style={CSS.styles.textBold}>
            {LNURLdata.maxWithdrawable / 1000}
          </Text>{' '}
          Gro
        </Text>
        <Pad amount={10} />
        <ShockInput
          keyboardType="numeric"
          onChangeText={this.setWithdrawAmount}
          value={withdrawal.toString()}
        />
        <View style={styles.switch}>
          <Text>add Memo</Text>
          <Switch value={hasMemo} onValueChange={this.setHasMemo} />
        </View>
        {hasMemo && (
          <ShockInput onChangeText={this.setMemo} value={memo} multiline />
        )}
        <Pad amount={10} />
        <ShockButton onPress={this.confirmWithdrawReq} title="RECEIVE" />
      </View>
    )
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderPay = LNURLdata => {
    const { payAmount, didChange } = this.state
    let pay = payAmount
    if (!didChange && LNURLdata.minSendable === LNURLdata.maxSendable) {
      pay = LNURLdata.minSendable / 1000
    }
    //const hostname = new URL(LNURLdata.callback).hostname
    return (
      <View>
        <Text style={styles.bigBold}>LNURL Pay Request </Text>
        <Pad amount={10} />
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>Min </Text>
          Sendable :
        </Text>
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>
            {LNURLdata.minSendable / 1000}{' '}
          </Text>
          Gro
        </Text>
        <Pad amount={10} />

        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>Max </Text>
          Sendable :
        </Text>
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>
            {LNURLdata.maxSendable / 1000}{' '}
          </Text>
          Gro
        </Text>

        <Pad amount={10} />

        <ShockInput
          keyboardType="numeric"
          onChangeText={this.setPayAmount}
          value={pay.toString()}
        />

        <Pad amount={10} />
        <ShockButton onPress={this.confirmPayReq} title="SEND" />
      </View>
    )
  }

  renderUnknown = () => {
    return <Text>LNURL : Unknown Request</Text>
  }

  componentWillReceiveProps() {
    const { resetLNURL } = this.props
    if (resetLNURL) {
      this.localReset()
    }
  }

  render() {
    const visible = this.props.LNURLdata !== null
    if (visible === false) {
      return null
    }
    Logger.log('LNURL')
    Logger.log(this.props.LNURLdata)
    const { done, error } = this.state
    return (
      <ShockModal visible={visible} onRequestClose={this.props.requestClose}>
        <View style={styles.flexCenter}>
          {done === null &&
            error === null &&
            this.handleUrl(this.props.LNURLdata)}
          {done !== null && this.handleDone()}
          {error !== null && this.handleError()}
        </View>
      </ShockModal>
    )
  }
}

const styles = StyleSheet.create({
  bigBold: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  selfCenter: {
    alignSelf: 'center',
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  switch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerBold: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
})
