import { Navigate } from "react-router-dom";

export default function Require2FA({ children }) {
  const challengeId = localStorage.getItem("2fa_challenge");

  if (!challengeId) {
    return <Navigate to="/" replace />;
  }

  return children;
}