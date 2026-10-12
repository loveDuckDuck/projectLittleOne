import { useEffect, useRef } from 'react';
import type { ProjectSummary } from '../../utils/projectStorage';

export function ProjectsDialog({ projects, activeId, onOpen, onClose }: { projects: ProjectSummary[]; activeId: string; onOpen: (id: string) => boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="new-cv-dialog projects-dialog" aria-labelledby="projects-title" onClose={onClose}>
    <h2 id="projects-title">I miei CV</h2><p>Progetti salvati in questo browser. Scarica una copia modificabile per conservarli anche altrove.</p>
    <div className="project-list">{projects.map((project) => <button type="button" key={project.id} onClick={() => { if (onOpen(project.id)) onClose(); }}>
      <strong>{project.name}</strong><small>{project.id === activeId ? 'Aperto · ' : ''}{new Date(project.updatedAt).toLocaleString('it-IT')}</small><span>Apri</span>
    </button>)}{projects.length === 0 && <p>Il primo progetto apparirà dopo il salvataggio.</p>}</div>
    <div className="dialog-actions"><button type="button" onClick={onClose}>Chiudi</button></div>
  </dialog>;
}
