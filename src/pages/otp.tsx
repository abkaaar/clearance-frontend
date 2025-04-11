import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { OtpView } from 'src/sections/auth';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Sign in - ${CONFIG.appName}`}</title>
      </Helmet>

      <OtpView />
    </>
  );
}
