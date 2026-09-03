// Material Design icon paths (Apache 2.0, from google/material-design-icons)
function Icon({ d, size = 20, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}

export const AddIcon = (props) => (
  <Icon d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" {...props} />
)

export const CloseIcon = (props) => (
  <Icon d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" {...props} />
)

export const DeleteIcon = (props) => (
  <Icon d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" {...props} />
)

export const CheckIcon = (props) => (
  <Icon d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" {...props} />
)

export const CheckCircleIcon = (props) => (
  <Icon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" {...props} />
)

export const CircleOutlineIcon = (props) => (
  <Icon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" {...props} />
)

export const TimelapseIcon = (props) => (
  <Icon d="M16.24 7.76C15.07 6.59 13.54 6 12 6v6l-4.24 4.24c2.34 2.34 6.14 2.34 8.49 0 2.34-2.34 2.34-6.14-.01-8.48zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" {...props} />
)

export const RestoreIcon = (props) => (
  <Icon d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" {...props} />
)

export const ErrorOutlineIcon = (props) => (
  <Icon d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" {...props} />
)

export const ExpandMoreIcon = (props) => (
  <Icon d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" {...props} />
)

export const ChevronRightIcon = (props) => (
  <Icon d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" {...props} />
)

export const FlagIcon = (props) => (
  <Icon d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" {...props} />
)
