import { AnimatePresence, motion } from "framer-motion";
import Prism from "prismjs";
import React, { useState } from "react";
import { getAccountId, isSignedIn } from "./lib/web4";

// Types
type ContractCallParams = {
  contractId: string;
  methodName: string;
  params: Record<string, string>;
};

type SignParams = {
  web4_contract_id: string;
  web4_method_name: string;
  web4_args: string;
  web4_gas?: string;
  web4_deposit?: string;
  web4_callback_url?: string;
};

type Tab = "view" | "sign";

// Global code generators
const codeGenerators = {
  view: (
    contractId: string,
    methodName: string,
    params: Array<[string, string]>
  ) => {
    const searchParams = new URLSearchParams();
    params.forEach(([key, value]) => {
      if (key && value) {
        if (value.startsWith("{") || value.startsWith("[")) {
          searchParams.append(`${key}.json`, value);
        } else {
          searchParams.append(key, value);
        }
      }
    });
    const url = `/web4/contract/${contractId}/${methodName}?${searchParams.toString()}`;

    const paramsObject = params.reduce((acc, [key, value]) => {
      if (key && value) {
        if (value.startsWith("{") || value.startsWith("[")) {
          acc[`${key}.json`] = value;
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    return `// View Method Call
const response = await fetch("${url}");
const result = await response.json();

// Full parameters for reference:
const params = ${JSON.stringify(paramsObject, null, 2)};

// Contract: ${contractId}
// Method: ${methodName}
`;
  },
  sign: (params: SignParams) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    const url = `/web4/sign?${searchParams.toString()}`;

    return `// Sign Transaction
window.location.href = "${url}";

// Full parameters for reference:
const params = ${JSON.stringify(params, null, 2)};

// Note: This will redirect to the signing page
`;
  },
};

// Create refs to store form state
let viewFormRef: {
  contractId: string;
  methodName: string;
  params: Array<[string, string]>;
} | null = null;
let signFormRef: SignParams | null = null;

// Components
function ViewMethodForm({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [contractId, setContractId] = useState("");
  const [methodName, setMethodName] = useState("");
  const [params, setParams] = useState<Array<[string, string]>>([["", ""]]);
  const [viewOutput, setViewOutput] = useState<string>("");

  const buildUrl = () => {
    const searchParams = new URLSearchParams();
    params.forEach(([key, value]) => {
      if (key && value) {
        if (value.startsWith("{") || value.startsWith("[")) {
          searchParams.append(`${key}.json`, value);
        } else {
          searchParams.append(key, value);
        }
      }
    });
    return `/web4/contract/${contractId}/${methodName}?${searchParams.toString()}`;
  };

  // Update ref when state changes
  React.useEffect(() => {
    viewFormRef = { contractId, methodName, params };
  }, [contractId, methodName, params]);

  const handleSubmit = async () => {
    const url = buildUrl();
    onSubmit(url);
    try {
      const response = await fetch(url);
      const data = await response.text();
      setViewOutput(data);
    } catch (error) {
      setViewOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          className="w-full p-2 border rounded shadow-sm"
          placeholder="Contract ID"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded shadow-sm"
          placeholder="Method Name"
          value={methodName}
          onChange={(e) => setMethodName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        {params.map((param, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                className="flex-1 p-2 border rounded shadow-sm"
                placeholder="Parameter Key"
                value={param[0]}
                onChange={(e) => {
                  const newParams = [...params];
                  newParams[index][0] = e.target.value;
                  setParams(newParams);
                }}
              />
              <button
                className="px-4 py-2 text-red-600 border rounded hover:bg-red-50 shadow-sm"
                onClick={() => setParams(params.filter((_, i) => i !== index))}
              >
                ✕
              </button>
            </div>
            <input
              className="w-full p-2 border rounded shadow-sm"
              placeholder="Parameter Value"
              value={param[1]}
              onChange={(e) => {
                const newParams = [...params];
                newParams[index][1] = e.target.value;
                setParams(newParams);
              }}
            />
          </div>
        ))}
        <button
          className="w-full p-2 text-blue-600 border rounded hover:bg-blue-50 shadow-sm"
          onClick={() => setParams([...params, ["", ""]])}
        >
          Add Parameter
        </button>
      </div>
      <button
        className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700 shadow-md"
        onClick={handleSubmit}
      >
        Call View Method
      </button>
      {viewOutput && (
        <div className="mt-4 p-4 bg-gray-50 rounded shadow-inner">
          <h3 className="text-lg font-bold mb-2">View Output:</h3>
          <pre className="whitespace-pre-wrap break-words">{viewOutput}</pre>
        </div>
      )}
    </div>
  );
}

function SignTransactionForm({
  onSubmit,
}: {
  onSubmit: (url: string) => void;
}) {
  const [params, setParams] = useState<SignParams>({
    web4_contract_id: "",
    web4_method_name: "",
    web4_args: "",
    web4_gas: "",
    web4_deposit: "",
    web4_callback_url: "",
  });

  const buildUrl = () => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    return `/web4/sign?${searchParams.toString()}`;
  };

  // Update ref when state changes
  React.useEffect(() => {
    signFormRef = params;
  }, [params]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {Object.entries(params).map(([key, value]) => (
          <input
            key={key}
            className="w-full p-2 border rounded shadow-sm"
            placeholder={key.replace("web4_", "").replace("_", " ")}
            value={value}
            onChange={(e) => setParams({ ...params, [key]: e.target.value })}
          />
        ))}
      </div>
      <button
        className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700 shadow-md"
        onClick={() => onSubmit(buildUrl())}
      >
        Sign Transaction
      </button>
    </div>
  );
}

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`px-6 py-2 rounded-t-lg relative ${
        selected
          ? "bg-white text-blue-600 shadow-md z-10"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function App() {
  const isLoggedIn = isSignedIn();
  const [previewUrl, setPreviewUrl] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("view");

  const handleLogin = () => {
    window.location.href = "/web4/login";
  };

  const handleLogout = () => {
    window.location.href = "/web4/logout";
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const CodeSnippet = ({ code }: { code: string }) => {
    const highlightedCode = Prism.highlight(
      code,
      Prism.languages.javascript,
      "javascript"
    );

    return (
      <div className="relative">
        <pre className="bg-gray-900 text-white p-4 rounded-lg shadow-inner overflow-x-auto">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
        <button
          onClick={() => copyToClipboard(code)}
          className="absolute top-2 right-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 shadow-sm"
        >
          Copy
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 mx-auto max-w-3xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">web4 sandbox</h1>
            <div className="space-x-2">
              {!isLoggedIn ? (
                <button
                  className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 shadow-md"
                  onClick={handleLogin}
                >
                  Login
                </button>
              ) : (
                <>
                  {getAccountId()}
                  <button
                    className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 shadow-md"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            <TabButton
              selected={activeTab === "view"}
              onClick={() => setActiveTab("view")}
            >
              Call View Method
            </TabButton>
            <TabButton
              selected={activeTab === "sign"}
              onClick={() => setActiveTab("sign")}
            >
              Sign Transaction
            </TabButton>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "view" ? (
                  <ViewMethodForm onSubmit={setPreviewUrl} />
                ) : (
                  <SignTransactionForm onSubmit={setPreviewUrl} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {previewUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-4 bg-gray-50 rounded-lg shadow-inner"
            >
              <h3 className="text-lg font-bold mb-2">Generated URL:</h3>
              <div className="break-all">{previewUrl}</div>
              <a
                href={previewUrl}
                className="mt-4 inline-block px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 shadow-md"
              >
                Try it
              </a>
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2">Code Snippet:</h3>
                <CodeSnippet
                  code={
                    activeTab === "view" && viewFormRef
                      ? codeGenerators.view(
                          viewFormRef.contractId,
                          viewFormRef.methodName,
                          viewFormRef.params
                        )
                      : activeTab === "sign" && signFormRef
                      ? codeGenerators.sign(signFormRef)
                      : "// No form data available"
                  }
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default App;
