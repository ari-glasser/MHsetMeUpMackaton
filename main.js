import path from "path";
import {getLlama, LlamaChatSession } from "node-llama-cpp";
import { fileURLToPath } from "url";
import child from "child_process";

function runAuitomations(){
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const scriptPath = path.join(__dirname, "run-automations.js");
    console.log("Running automations script: " + scriptPath);
    child.execSync(`node ${scriptPath}`, { stdio: 'inherit' });
}
(async () => {
    const llama = await getLlama();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const modelPath = path.join(__dirname, "models", "meta-llama-3.1-8b-instruct-hf-q4_k_m.gguf");
    console.log("Llama version: " + llama.version);
    console.log("modelPath",modelPath);
    const model = await llama.loadModel({modelPath});


    const context = await model.createContext();
    const session = new LlamaChatSession({
        contextSequence: context.getSequence()
    });

    const aautomations = "";
; 
    const q1 = "Hi look at this list of automations, how are you?";
    console.log("User: " + q1);

    const a1 = await session.prompt(q1);
    console.log("AI: " + a1);

    const q2 = "tel me a knock knock joke";
    console.log("User: " + q2);

    const a2 = await session.prompt(q2);
    console.log("AI: " + a2);
})();