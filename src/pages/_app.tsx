import { useEffect, useState } from "react";
import { AppProps } from "next/app";
import { supabase } from "../lib/supabase";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();
  }, []);

  return (
   
      <Component {...pageProps} />
   );
}
