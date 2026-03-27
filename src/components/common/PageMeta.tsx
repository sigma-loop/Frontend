import React from "react";
import { Helmet } from "react-helmet-async";

interface PageMetaProps {
  title: string;
  description?: string;
  favicon?: string;
}

const PageMeta: React.FC<PageMetaProps> = ({
  title,
  description = "Master the Logic behind the Code.",
  favicon = "/favicon.svg",
}) => {
  return (
    <Helmet>
      <title>{title} | SigmaLoop</title>
      <meta name="description" content={description} />
      <link rel="icon" type="image/svg+xml" href={favicon} />
    </Helmet>
  );
};

export default PageMeta;
