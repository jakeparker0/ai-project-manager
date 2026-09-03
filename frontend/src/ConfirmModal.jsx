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
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={handleConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}
