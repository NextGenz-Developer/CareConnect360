import { HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

type BrandProps = {
  light?: boolean;
};

export function Brand({ light = false }: BrandProps) {
  return (
    <Link className={`brand${light ? " brand-light" : ""}`} to="/" aria-label="CareConnect 360 home">
      <span className="brand-mark" aria-hidden="true">
        <HeartHandshake size={21} strokeWidth={2.2} />
      </span>
      <span className="brand-name">CareConnect <b>360</b></span>
    </Link>
  );
}