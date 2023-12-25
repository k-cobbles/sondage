import Link from 'next/link';
import react from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import useHandleDeleteSondage from '../hooks/useHandleDelete';

type SondagesListProps = {
  copyLinkConfirmation: () => void;
  sondages: Sondage[];
}

export default function SondagesList({ copyLinkConfirmation, sondages }: SondagesListProps) {

  const handleDeleteSondage = useHandleDeleteSondage();


  return (
    <>
      <ul className="sondage-list">
        {sondages.length > 0 ?
          sondages.map((sondage, index) => {
            return (
              <li key={index} className="item">
                <div className="details">
                  <h2>{sondage.title}</h2>
                </div>
                <div className="actions">
                  <p>{sondage.description}</p>
                  <Button size="small"><Link href={`/sondages/play/${sondage._id}`}>Play</Link></Button>
                  <Button size="small"><Link href={`/sondages/result/${sondage._id}`}>Result</Link></Button>
                  <Button
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(`/sondages/play/${sondage._id}`);
                      copyLinkConfirmation();
                    } }
                  >copy link
                  </Button>
                </div>
              </li>
            );
          })
          : (
            <h2 className="heading">Ooops! No sondages added so far</h2>
          )}
      </ul>
      <style jsx>
        {`
          .sondage-list {
            list-style-type: none;
            display: block;
            padding: 0;
            border: 2px dashed var(--primary-border);
            border-radius: 40px;
          }
          .sondage-list .item {
            padding: 6px 15px 16px;
            border-top: 2px dashed var(--primary-border);
          }
          .sondage-list .item:first-child {
            border: none;
          }
          .sondage-list .item h2 {
            margin: 10px 0px;
          }
          .sondage-list .item .actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            flex-wrap: wrap;
          }
          .sondage-list .item .actions p {
              margin-right: auto;
              margin-bottom: 4px;
          }
          .sondage-list .item .actions  :global(a) {
            text-decoration: none;
            margin-right: auto;
          }
          .sondage-list .item .actions :global(button) {
            margin-left: 2px;
          }

          .sondage-list h2.heading {
            color: var(--border);
          }

          @media (max-width: 480px) {
            .sondage-list .item {
            }
            .sondage-list .item .actions {
              justify-content: flex-end;
            }
            .sondage-list .item h2 {
              margin-bottom: 0;
            }
            .sondage-list .item .actions p {
              width: 100%;
              margin-bottom: 16px;
            }
          }
          
        `}
      </style>
    </>
  )
}
