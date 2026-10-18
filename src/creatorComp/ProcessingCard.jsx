import { Loader2, Music } from "lucide-react";
import styles from "./ProcessingCard.module.css";

const ProcessingCard = ({ title, genre }) => (
  <div className={styles.card} aria-busy="true">
    <div className={styles.cover}>
      <Music size={28} />
      <div className={styles.shimmer} />
    </div>

    <div className={styles.info}>
      <h3 className={styles.title}>{title}</h3>
      <span className={styles.genre}>{genre}</span>
    </div>

    <div className={styles.status}>
      <Loader2 size={16} className={styles.spin} />
      <span>Processing... going live shortly</span>
    </div>
  </div>
);

export default ProcessingCard;
