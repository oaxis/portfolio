// TERMINAL DOM ELEMENTS
const appHTML = `
<textarea id="terminal" disabled></textarea>
<input id="terminalInput" type="text" placeholder="type a command (use 'help' to see available commands)" />
<span class="terminal-input-arrow">></span>
<div id="links"></div>
<div id="autocomplete"></div>`;
const body = document.getElementById('app');
body.innerHTML = appHTML + body.innerHTML;
const t = document.getElementById('terminal');
const input = document.getElementById('terminalInput');
const links = document.getElementById('links');
const autocomplete = document.getElementById('autocomplete');

// GLOBAL VARIABLES
MAX_LINES = 100;
PREFIX_USER_COMMAND = '\n>';
SOFT_SKILLS_URL = 'https://teambuildr.fr/test/c8c7cb23-48b9-4ba2-8c27-58bd65d2f631/profile';
COMMAND_LIST = [];
// #########################

/* 
    Append terminal
*/
const terminalAppend = (str) => {
    t.value += `\n${str}`;
    // handlers
    handleOutput();
}

/* 
    Handles output to check for links or other points of interest
*/
const handleOutput = () => {
    handleTerminalLinks();
    handleLineNumbers();
    handleScroll();
    handleFormatting();
}

/*
    handle scroll to bottom of textarea
*/
const handleScroll = () => {
    t.scrollTop = t.scrollHeight;
}

/*
    handle formatting
*/
const handleFormatting = () => {
    // Removing extra spaces
    t.value = t.value.replace(/ {2}/g, '');
}

/*
    handle lines numbers
*/
const handleLineNumbers = () => {
    let lines = t.value.split('\n');
    if (lines.length > MAX_LINES) {
        lines = lines.slice(-MAX_LINES);
    }
    t.value = lines.join('\n');
}

/*
    handle links to show in links container
*/
const handleTerminalLinks = () => {
    // Regex to match links & mails
    const linkRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const mailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,4}/g;
    // Get links and mails from output and add them to links container
    let foundLinks = t.value.match(linkRegex);
    if (foundLinks) {
        // Take the last 4 links
        if (foundLinks.length > 4) {
            foundLinks = foundLinks.slice(-4);
        }
        // Craft HTML from links
        let linksHTML = '';
        for (const link of foundLinks) {
            if (link.match(mailRegex)) {
                linksHTML += `<a href="mailto:${link}" target="_blank">${link}</a>`;
            } else {
                linksHTML += `<a href="https://${link}" target="_blank">${link}</a>`;
            }
        }
        // Set links container childs to matched links
        links.innerHTML = linksHTML;
    } else {
        flushInner(links)
    }
}

/*
    Listen for keypress in the terminal input
*/
input.addEventListener('keydown', (e) => {
    // If enter key is pressed
    if (e.key === 'Enter') {
        if (input.value.length === 0)
            return;
        terminalAppend(`${PREFIX_USER_COMMAND} ${input.value}`);

        // check if commands exist, if so execute related command
        if (commands[input.value] !== undefined) {
            commands[input.value].func();
        } else {
            terminalAppend(`${input.value} ${texts.commands.notvalid}`);
        }
        // clear input value
        input.value = '';
        return
    }
});

/*
    Listen for KeyUp on the terminal input
*/
input.addEventListener('keyup', (e) => {
    if(e.key === 'Enter'){
        displayCommandList(false);
        return;
    }
    if (input.value.length > 0) {
        // Fill autocomplete list with commands matching the input
        flushInner(autocomplete);
        let foundAutoComplete = false;
        for (const suggestion of COMMAND_LIST.filter(command => command.startsWith(input.value))) {
            foundAutoComplete = true;
            autocomplete.innerHTML += `<span>${suggestion}</span>`;
        }
        displayCommandList(foundAutoComplete);
        return;
    }
    displayCommandList(false);
});

/*
    Listen for click to refocus
*/
document.addEventListener('click', () => {
    input.focus();
});

/* 
    Display command list
*/
const displayCommandList = (show) => {
    if (show) {
        autocomplete.style.display = 'block';
    } else {
        autocomplete.style.display = 'none';
    }
}

/*
    Clean innerHTML of element
*/
const flushInner = (element) => {
    element.innerHTML = '';
}

/*
    Commands
*/
commands = {
    help: {
        description: "Display all available commands",
        func: () => {
            // iterate over commands and print description
            for (let key in commands) {
                terminalAppend(`${key}\t: ${commands[key].description}`);
            }
        }
    },
    about: {
        description: "Display a short bio",
        func: () => {
            terminalAppend(texts.commands.about);
        }
    },
    skills: {
        description: "Display a list of my hard skills",
        func: () => {
            terminalAppend(texts.commands.skills);
        }
    },
    works: {
        description: "Display my projects",
        func: () => {
            terminalAppend(texts.commands.projects);
        }
    },
    contact: {
        description: "Display my contact informations",
        func: () => {
            terminalAppend(texts.commands.contact);
        }
    },
    softs: {
        description: "Opens my soft skills page",
        func: () => {
            window.open(SOFT_SKILLS_URL, '_blank');
        }
    },
    clear: {
        description: "Clears the terminal",
        func: () => {
            t.value = links.innerHTML = '';
        }
    },
}


/*
    Init
*/
const init = () => {
    // Initialize command list
    for (let key in commands) {
        COMMAND_LIST.push(key);
    }
    // Display welcome message
    terminalAppend(texts.welcome)
    // Focus on the input
    input.focus();
}
init();