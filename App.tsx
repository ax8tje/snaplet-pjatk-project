import React, { useEffect } from "react";
import { RootNavigator } from "./src/navigation";
import { useUserStore } from "./src/store/userStore";

function App(): React.JSX.Element {
  useEffect(() => {
    const unsubscribe = useUserStore.getState().initialize();
    return () => {
      unsubscribe();
    };
  }, []);

  return <RootNavigator />;
}

export default App;