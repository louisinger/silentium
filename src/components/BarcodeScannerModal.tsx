import BarcodeScanner, { BarcodeScannerProps } from './BarcodeScanner'
import Modal from './Modal'

type BarCodeScannerModalProps = BarcodeScannerProps & { open: boolean, onClose: () => void }

export default function BarcodeScannerModal(props: BarCodeScannerModalProps) {
  return (
    <Modal withoutBorder title='' open={props.open} onClose={props.onClose}>
      { props.open ? <BarcodeScanner {...props} /> : null }
    </Modal>
  )
}
