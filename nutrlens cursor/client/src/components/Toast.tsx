import { Toaster } from 'react-hot-toast';

const Toast = () => <Toaster position="top-center" toastOptions={{
  className: 'rounded-xl shadow font-semibold text-sm',
  style: { background: '#fff', color: '#222' },
}} />;

export default Toast; 