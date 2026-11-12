import { Link } from "react-router-dom";
import { ArrowLeft, Home, Store } from "lucide-react";

import Button from "../../../components/ui/Button";
import LostPage from "../../../components/ui/LostPage";
import { Container } from "../components/Primitives";
import SearchBox from "../components/SearchBox";
import { getCategoryTree } from "../../../api/storeApi";
import { useApi } from "../../../hooks/useApi";
import { useI18n } from "../../../lib/i18n";

/**
 * Storefront 404, also used for a missing order or product.
 *
 * Offers the usual ways back plus a search box and the departments, so a
 * dead link still ends in a shop rather than a shrug.
 */
const NotFound = ({
  title = "This page wandered off",
  description = "The link may be old or mistyped. Let's get you back to shopping.",
  backTo,
  backLabel,
}) => {
  const { t } = useI18n();
  const { data: tree } = useApi(getCategoryTree, null, { cacheTime: 5 * 60 * 1000 });

  return (
    <Container>
      <LostPage
        title={t(title)}
        description={t(description)}
        actions={
          <>
            {backTo && (
              <Button as={Link} to={backTo} icon={ArrowLeft}>
                {t(backLabel || "Go back")}
              </Button>
            )}
            <Button as={Link} to="/" variant={backTo ? "secondary" : "primary"} icon={Home}>
              {t("Back to home")}
            </Button>
            <Button as={Link} to="/shop" variant="secondary" icon={Store}>
              {t("Browse the shop")}
            </Button>
          </>
        }
      >
        <div className="mx-auto max-w-md">
          <SearchBox />
        </div>
        {tree?.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {tree.map((dept) => (
              <Link
                key={dept._id}
                to={`/shop?dept=${dept._id}`}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.8125rem] font-medium text-content-secondary transition-colors hover:border-accent hover:text-accent-text"
              >
                {dept.name}
              </Link>
            ))}
          </div>
        )}
      </LostPage>
    </Container>
  );
};

export default NotFound;
