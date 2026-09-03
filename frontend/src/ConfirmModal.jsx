import Modal from './Modal'

export default function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  async function handleConfirm() {
    await onConfirm()
    onClose()
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="confirm-message">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-text" onClick={onClose} autoFocus>Cancel</button>
        <button className="btn btn-text btn-error" onClick={handleConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}
