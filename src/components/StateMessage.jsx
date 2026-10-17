// One component for the three non-happy states: loading, error, and empty.
export default function StateMessage({ kind = 'empty', title, children, action }) {
  return (
    <div
      className={`state state-${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      {kind === 'loading' && <span className="spinner" aria-hidden="true" />}
      <h2 className="state-title">{title}</h2>
      {children && <p className="state-text">{children}</p>}
      {action}
    </div>
  );
}
