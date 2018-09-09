function print_message(text) {
    var old_text = terminal_window.value;
    if (old_text.length) {
        terminal_window.value = old_text + "\n" + text;
    } else {
        terminal_window.value = text;
    }
    terminal_window.scrollTop = terminal_window.scrollHeight;
}

function user_command() {
    var cmd = terminal_input.value;
    print_message(">>> " + cmd)
    terminal_input.value = "";
    if (GAME_OVER) { return; }
    if (cmd == "help") {
        print_message(HELP);
    } else if (control.cur_scene.type == "menu") { return;
    } else if (cmd.startsWith("help ")) {
        var item = cmd.slice(5);
        if (item in PROGRAM_HELP) {
            print_message(PROGRAM_HELP[item]);
        } else if (item in SCRIPT_HELP) {
            print_message(SCRIPT_HELP[item]);
        }
    } else if (cmd == "ls") {
        print_message("programs/  scripts/  installed/");
    } else if (cmd == "ls programs" || cmd == "ls programs/") {
        print_message("Available programs:");
        print_message(DATA["programs"]);
    } else if (cmd == "ls scripts" || cmd == "ls scripts/") {
        print_message("Available scripts:");
        print_message(DATA["scripts"]);
    } else if (cmd == "ls installed" || cmd == "ls installed/") {
        print_message("Programs installed:");
        print_message(DATA["installed"]);
    } else if (cmd.startsWith("install ")) {
        var program = cmd.slice(8),
            index = DATA["programs"].indexOf(program);

        if (index < 0) {
            print_message("There's no program named " + program);
            return;
        }

        if (DATA["installed"].indexOf(program) > -1) {
            print_message("Program " + program + " is already installed");
            return;
        }

        if (DATA["installed"].length === DATA["memory"]) {
            print_message("There's no memory available, try uninstalling another program");
            return;
        }

        DATA["installed"].push(DATA["programs"][index]);
        print_message("Successfully installed " + program);

    } else if (cmd.startsWith("uninstall ")) {
        var program = cmd.slice(10),
            index = DATA["installed"].indexOf(program);
        if (index < 0) {
            print_message("Program " + program + " is not installed.");
            return;
        }

        DATA["installed"].splice(index, 1);
        print_message("Successfully uninstalled " + program);

    } else if (DATA["scripts"].indexOf(cmd) > -1) {
        index = DATA["scripts"].indexOf(cmd);
        var script = SCRIPTS[cmd];
        print_message(script["msg"]);
        script["run"](control.cur_scene.dungeon);
        DATA["scripts"].splice(index, 1);
        control.cur_scene.dungeon.executeTurn();
    }
}