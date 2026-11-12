import { useMemo } from "react";
import { EyeOff, History, Sparkles, Trash2 } from "lucide-react";

import { getForYou, getProductsByIds } from "../../../api/smartApi";
import { useApi } from "../../../hooks/useApi";
import { useRecentlyViewed } from "../../../lib/recentlyViewed";
import { useSession } from "../hooks/useStorefront";
import Button from "../../../components/ui/Button";
import { Container } from "./Primitives";
import ProductRail from "./ProductRail";

/**
 * Home-page personal sections: "Recommended for you" and "Recently viewed".
 *
 * Signals are the wishlist and past orders (signed in) plus this device's
 * recently viewed list, which is sent with the request and never stored.
 * New visitors see popular picks, labelled as such rather than as personal.
 */
const PersonalRails = () => {
  const { ids, paused, clear, togglePaused } = useRecentlyViewed();
  const { isLoggedIn } = useSession();
  const seen = useMemo(() => ids.slice(0, 12), [ids]);

  const forYou = useApi(getForYou, { seen, limit: 8, signedIn: isLoggedIn }, { cacheTime: 60 * 1000 });
  const recent = useApi(getProductsByIds, { ids: seen.slice(0, 8) }, { enabled: seen.length > 0 });
  const personalised = forYou.data?.personalised;

  return (
    <>
      <Container className="pb-section">
        <ProductRail
          eyebrow={personalised ? "Picked for you" : "Popular right now"}
          title={personalised ? "Recommended for you" : "Trending in the shop"}
          description={
            personalised
              ? "Based on what you've viewed, saved and bought."
              : "Browse a few products and this becomes personal to you."
          }
          products={forYou.data?.products}
          loading={forYou.loading}
          error={forYou.error}
          onRetry={forYou.refetch}
          caption={(product) => product.reason}
          action={<Sparkles size={20} className="hidden text-accent-text sm:block" />}
        />
      </Container>

      {(seen.length > 0 || paused) && (
        <Container className="pb-section">
          <ProductRail
            eyebrow="Pick up where you left off"
            title="Recently viewed"
            description="Kept only on this device."
            products={recent.data}
            loading={recent.loading && seen.length > 0}
            empty={
              <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center type-caption">
                {paused ? "History is paused, so nothing new is being saved." : "Nothing here yet."}
              </p>
            }
            action={
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={paused ? History : EyeOff} onClick={togglePaused}>
                  {paused ? "Resume history" : "Pause history"}
                </Button>
                {seen.length > 0 && (
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={clear}>
                    Clear
                  </Button>
                )}
              </div>
            }
          />
        </Container>
      )}
    </>
  );
};

export default PersonalRails;
