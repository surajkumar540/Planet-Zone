import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

import Button from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/States";
import { Container } from "../components/Primitives";

const NotFound = () => (
  <Container className="py-24">
    <EmptyState
      icon={Compass}
      title="That page does not exist"
      description="The link may be out of date, or the product may have been removed."
      action={
        <div className="flex gap-2">
          <Button as={Link} to="/" variant="primary">
            Back to home
          </Button>
          <Button as={Link} to="/shop">
            Browse the shop
          </Button>
        </div>
      }
    />
  </Container>
);

export default NotFound;
