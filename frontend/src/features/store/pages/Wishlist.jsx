import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import Button from "../../../components/ui/Button";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/States";
import { Container } from "../components/Primitives";
import ProductCard from "../components/ProductCard";
import { useWishlistToggle } from "../hooks/useWishlist";

/** Saved products, loaded once by the layout's provider. */
const Wishlist = () => {
  const { items, loading, toggle, isWishlisted } = useWishlistToggle();

  return (
    <Container className="py-8">
      <header className="mb-6">
        <h1 className="type-page-title text-content">Your wishlist</h1>
        <p className="type-description mt-1">
          {items.length} saved item{items.length === 1 ? "" : "s"}
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="aspect-[3/4] w-full rounded-lg" />
          ))}
        </div>
      ) : items.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onToggleWishlist={toggle}
              isWishlisted={isWishlisted(product._id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here for later."
          action={
            <Button as={Link} to="/shop" variant="primary">
              Browse products
            </Button>
          }
        />
      )}
    </Container>
  );
};

export default Wishlist;
