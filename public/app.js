const chat = document.getElementById("chat");
const input = document.getElementById("input");
const composer = document.getElementById("composer");
const send = document.getElementById("send");

const modelSelect = document.getElementById("model");

const welcome = document.getElementById("welcome");
const history = document.getElementById("history");

const sidebar = document.getElementById("sidebar");
const menu = document.getElementById("menu");

const themeButton = document.getElementById("themeButton");
const newChat = document.getElementById("newChat");


let messages = [];
let chats = [];

let generating = false;


/* THEME */

themeButton.onclick = () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );
};

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}


/* MOBILE MENU */

menu.onclick = () => {
    sidebar.classList.toggle("open");
};


/* NEW CHAT */

newChat.onclick = () => {
    messages = [];

    chat.innerHTML = "";
    chat.appendChild(welcome);

    welcome.style.display = "block";

    input.value = "";

    sidebar.classList.remove("open");
};


/* PROMPT BUTTONS */

function usePrompt(text) {
    input.value = text;
    input.focus();

    autoResize();
}


/* TEXTAREA */

input.addEventListener("input", autoResize);

function autoResize() {
    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 180) + "px";
}


/* ENTER */

input.addEventListener("keydown", e => {

    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        composer.requestSubmit();
    }

});


/* ADD MESSAGE */

function addMessage(role, content = "") {

    welcome.style.display = "none";

    const wrapper = document.createElement("div");

    wrapper.className =
        `message ${role}`;

    const avatar = document.createElement("div");

    avatar.className = "role";

    avatar.textContent =
        role === "user" ? "You" : "AI";


    const bubble = document.createElement("div");

    bubble.className = "bubble";

    if (role === "assistant") {

        bubble.innerHTML =
            DOMPurify.sanitize(
                marked.parse(content)
            );

    } else {

        bubble.textContent = content;

    }


    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    chat.appendChild(wrapper);

    chat.scrollTop = chat.scrollHeight;

    return bubble;
}


/* SEND */

composer.addEventListener("submit", async e => {

    e.preventDefault();

    const text = input.value.trim();

    if (!text || generating) return;


    generating = true;

    send.disabled = true;


    /* USER */

    messages.push({
        role: "user",
        content: text
    });

    addMessage("user", text);

    input.value = "";
    autoResize();


    /* ASSISTANT */

    const assistantBubble =
        addMessage("assistant", "");


    messages.push({
        role: "assistant",
        content: ""
    });


    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                model: modelSelect.value,
                messages
            })

        });


        if (!response.ok) {

            const error =
                await response.json();

            throw new Error(
                error.error || "Request failed"
            );
        }


        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder();


        let buffer = "";
        let fullText = "";


        while (true) {

            const {
                value,
                done
            } = await reader.read();

            if (done) break;


            buffer +=
                decoder.decode(value, {
                    stream: true
                });


            const lines =
                buffer.split("\n");

            buffer =
                lines.pop();


            for (const line of lines) {

                if (!line.startsWith("data:"))
                    continue;


                const data =
                    line.slice(5).trim();


                if (data === "[DONE]")
                    continue;


                try {

                    const json =
                        JSON.parse(data);

                    const delta =
                        json.choices?.[0]?.delta?.content;


                    if (delta) {

                        fullText += delta;

                        assistantBubble.innerHTML =
                            DOMPurify.sanitize(
                                marked.parse(fullText)
                            );

                        chat.scrollTop =
                            chat.scrollHeight;
                    }

                } catch {
                    // Ignore malformed SSE chunks
                }

            }

        }


        messages[
            messages.length - 1
        ].content = fullText;


        saveCurrentChat();


    } catch (error) {

        assistantBubble.innerHTML =
            `<p><strong>Error:</strong> ${
                escapeHtml(error.message)
            }</p>`;

        messages.pop();

    } finally {

        generating = false;

        send.disabled = false;

        input.focus();

    }

});


/* HISTORY */

function saveCurrentChat() {

    if (!messages.length)
        return;


    const first =
        messages.find(
            m => m.role === "user"
        );

    if (!first)
        return;


    const title =
        first.content.slice(0, 40);


    chats.unshift({
        title,
        messages
    });


    chats =
        chats.slice(0, 20);


    localStorage.setItem(
        "chats",
        JSON.stringify(chats)
    );


    renderHistory();
}


function renderHistory() {

    history.innerHTML = "";

    chats.forEach((chatData, index) => {

        const item =
            document.createElement("div");

        item.className =
            "history-item";

        item.textContent =
            chatData.title;


        item.onclick = () => {

            messages =
                [...chatData.messages];

            chat.innerHTML = "";

            messages.forEach(message => {

                addMessage(
                    message.role,
                    message.content
                );

            });

            sidebar.classList.remove("open");
        };


        history.appendChild(item);

    });

}


try {

    chats =
        JSON.parse(
            localStorage.getItem("chats") || "[]"
        );

    renderHistory();

} catch {
    chats = [];
}


/* SECURITY */

function escapeHtml(text) {

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}