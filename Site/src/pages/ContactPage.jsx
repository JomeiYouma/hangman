// ============================================================
// Fichier : ContactPage.jsx
// Rôle   : Page de contact (placeholder).
//          Un composant React très simple sans props ni état.
//
// En React, même une page aussi simple est un composant
// à part entière. C'est le principe de « séparation des
// préoccupations » (separation of concerns) :
// chaque fichier a UNE responsabilité.
//
// Remarque : () sans déstructuration de props signifie
// que ce composant ne reçoit AUCUNE donnée de son parent.
//
// Debug  : console.log('[ContactPage] rendu')
// ============================================================
export const ContactPage = () => {
  return (
    <section className="card">
      <h2>Contact</h2>
      <p>You can add your GitHub, LinkedIn or portfolio links here.</p>
      <p>This section is ready for your personal information.</p>
    </section>
  )
}
