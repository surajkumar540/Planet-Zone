import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "../hooks/useStorefront";
import { Container } from "./Primitives";
import { SkeletonText } from "../../../components/ui/Skeleton";

/**
 * Gates the customer-only screens.
 *
 * The session is restored asynchronously, so rendering has to wait for it: a
 * redirect fired while the status is still unknown would sign out a returning
 * customer on every refresh. The intended path travels with the redirect so
 * login can return the customer to where they were headed.
 */
const RequireAuth = () => {
  const { isLoggedIn, status } = useSession();
  const location = useLocation();

  if (status === "idle" || status === "loading") {
    return (
      <Container className="py-16">
        <SkeletonText lines={6} />
      </Container>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
