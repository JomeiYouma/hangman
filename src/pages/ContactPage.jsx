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
import Lanyard from '../components/Lanyard.jsx'

export const ContactPage = () => {
  return (
    <section className="card contact-layout">
      <div>
        <h2>Operator Profile</h2>
        <p className="status-line">Identity: Youma / Raphaël MADORÉ</p>
        <p>Role: Web full stack developer</p>
        <p>
          LinkedIn:{' '}
          <a href="https://www.linkedin.com/in/raphaël-madoré/" target="_blank" rel="noreferrer" className="contact-link">
            https://www.linkedin.com/in/raphaël-madoré/
          </a>
        </p>
        <p className="contact-note">Drag the badge to simulate access card validation.</p>
      </div>

      <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
    </section>
  )
}
