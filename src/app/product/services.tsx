export default function ServicesPage({
    params,
  }: {
    params: { id: string };
  }) {
    return (
      <div>
        <h1>Services Page {params.id}</h1>
        {/* Контент страницы */}
      </div>
    );
  }