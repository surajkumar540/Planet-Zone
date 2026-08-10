import cn from "../../lib/cn";

/**
 * The title block at the top of every dashboard screen.
 *
 * Exists so page titles, descriptions and primary actions sit in the same
 * place with the same spacing on every route.
 */
const PageHeader = ({ title, description, actions, breadcrumbs, className }) => (
  <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
    <div className="min-w-0">
      {breadcrumbs && <div className="mb-1.5">{breadcrumbs}</div>}
      <h1 className="type-page-title text-content">{title}</h1>
      {description && <p className="type-description mt-1">{description}</p>}
    </div>

    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
