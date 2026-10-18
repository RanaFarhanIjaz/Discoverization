import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmDialog from '../components/ConfirmDialog';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cancelRegistration } from '../features/registrations/registrationsSlice';
import { addToast } from '../features/ui/uiSlice';

// Shared by the event page and My Events so cancelling works the same everywhere.
export default function useCancelRegistration() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [target, setTarget] = useState(null);

  const confirm = () => {
    if (user && target) {
      dispatch(cancelRegistration({ userId: user.id, eventId: target.id }));
      dispatch(
        addToast({ type: 'info', message: `Registration cancelled for ${target.name}.` })
      );
    }
    setTarget(null);
  };

  const dialog = (
    <ConfirmDialog
      open={Boolean(target)}
      title="Cancel this registration?"
      message={target ? `You will no longer be registered for ${target.name}. You can register again later.` : ''}
      confirmLabel="Cancel registration"
      keepLabel="Keep registration"
      onConfirm={confirm}
      onCancel={() => setTarget(null)}
    />
  );

  return { requestCancel: setTarget, dialog };
}
