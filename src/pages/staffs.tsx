import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffsView } from 'src/sections/staffs/view';

// import { UserView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Users - ${CONFIG.appName}`}</title>
      </Helmet>

      {/* <UserView /> */}
      <StaffsView />
    </>
  );
}
