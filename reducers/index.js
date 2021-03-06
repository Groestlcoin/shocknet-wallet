import AuthReducer from './AuthReducer'
import HistoryReducer from './HistoryReducer'
import WalletReducer from './WalletReducer'
import NodeReducer from './NodeReducer'
import ChatReducer from './ChatReducer'
import InvoiceReducer from './InvoiceReducer'
import ConnectionReducer from './ConnectionReducer'

const rootReducer = {
  auth: AuthReducer,
  history: HistoryReducer,
  wallet: WalletReducer,
  node: NodeReducer,
  chat: ChatReducer,
  connection: ConnectionReducer,
  invoice: InvoiceReducer,
}

export default rootReducer
