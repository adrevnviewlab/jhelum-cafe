import { useEffect, useState } from 'react';

export default function Copyright() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  useEffect(() => {
    let timer;
    const refresh = () => {
      clearTimeout(timer);
      const now = new Date();
      setYear(now.getFullYear());
      // Check at midnight, including when a page is left open over New Year.
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(refresh, midnight.getTime() - now.getTime() + 100);
    };
    const onVisible = () => { if (!document.hidden) refresh(); };
    refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, []);
  return <p className="footer-copyright">© {year} Jehlum Cafe. All rights reserved.</p>;
}
