
interface PagePlaceholderProps {
  title: string;
  description: string;
}

export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <section className="page-placeholder">
      <div className="page-placeholder-breadcrumb">
        Field Report / {title}
      </div>

      <h1>{title}</h1>
      <p>{description}</p>

      <div className="placeholder-card">
        <div className="placeholder-icon">▤</div>
        <h2>Halaman siap dikembangkan</h2>
        <p>
          Komponen ini akan diisi dengan data dan fitur
          dari API backend pada tahap berikutnya.
        </p>
      </div>
    </section>
  );
}