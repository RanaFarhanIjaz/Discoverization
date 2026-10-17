import { Link } from 'react-router-dom';
import StateMessage from '../components/StateMessage';

export default function NotFoundPage() {
  return (
    <div className="container section">
      <StateMessage
        title="This page doesn't exist"
        action={<Link to="/events" className="btn btn-primary">Browse events</Link>}
      >
        The link may be broken, or the page may have moved.
      </StateMessage>
    </div>
  );
}
