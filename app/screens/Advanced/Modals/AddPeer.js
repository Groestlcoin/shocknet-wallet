import React from 'react'
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native'
import Modal from 'react-native-modalbox'
import Icon from 'react-native-vector-icons/Ionicons'
import ModalInput from '../../../components/PopupModal/Input'
import Head from '../../../components/PopupModal/Head'
import Body from '../../../components/PopupModal/Body'
import Footer from '../../../components/PopupModal/Footer'
import { Colors } from '../../../res/css'

const LOADING_BACKDROP = 'rgba(0,0,0,0.25)'

/**
 * @param {{
 *   modalRef: React.RefObject<any>,
 *   onChange: (key: keyof import("../index").State) => (value: any) => void,
 *   peerPublicKey: string,
 *   host: string,
 *   loading: boolean,
 *   submit: () => void,
 *   keyboardOpen: boolean,
 *   keyboardHeight: number,
 *   error: string,
 *   closeModal: () => void,
 * }} Props
 */
class AddPeerModal extends React.Component {
  render() {
    const {
      modalRef,
      onChange,
      peerPublicKey,
      host,
      submit,
      keyboardHeight = 0,
      keyboardOpen,
      loading,
      error,
      closeModal,
    } = this.props
    return (
      <Modal
        position="center"
        style={[
          styles.modal,
          keyboardOpen
            ? {
                marginTop: -1 * (keyboardHeight / 2),
              }
            : null,
        ]}
        ref={modalRef}
        backButtonClose
        useNativeDriver
      >
        {loading ? (
          <View style={styles.modalLoading}>
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : null}
        <Head>
          <View style={styles.close}>
            <Icon
              name="md-close"
              color="white"
              size={20}
              onPress={closeModal}
            />
          </View>
          <Icon name="md-add" color="white" size={35} />
        </Head>
        <Body>
          <Text style={styles.modalTitle}>Add Peer</Text>
          {error ? <Text style={styles.modalError}>{error}</Text> : null}
          <ModalInput
            placeholder="Peer Public Key"
            value={peerPublicKey}
            onChange={onChange('peerPublicKey')}
          />
          <ModalInput
            placeholder="Host"
            value={host}
            onChange={onChange('host')}
          />
        </Body>
        <Footer value="Add Peer" onPress={submit} />
      </Modal>
    )
  }
}

export default AddPeerModal

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
    zIndex: 100,
    height: 280,
    width: '80%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalLoading: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: LOADING_BACKDROP,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalTitle: {
    fontFamily: 'Montserrat-800',
    color: Colors.TEXT_GRAY,
    textAlign: 'center',
    width: '100%',
    marginBottom: 15,
    marginTop: 8,
    fontSize: 16,
  },
  modalError: {
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: Colors.ICON_RED,
    color: Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    width: '90%',
    borderRadius: 15,
    fontSize: 11,
  },
  close: {
    width: '80%',
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
})
