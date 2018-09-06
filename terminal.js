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
    if (control.cur_scene.type == "MainMenu") { return; }
    if (cmd == "help") {
        print_message(commandlist["help"]);
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

        if (control.cur_scene.type == "Dungeon") {
            print_message("Can't install programs while the Neural Link is connected.")
            return;
        }

        var program = cmd.slice(8),
            index = DATA["programs"].indexOf(program);

        if (index < 0) {
            print_message("There's no program named " + program);
            return;
        }

        if (DATA["installed"].indexOf(program) >= 0) {
            print_message("Program " + program + " is already installed");
            return;
        }

        if (DATA["installed"].length === DATA["memory"]) {
            print_message("There's no memory available, try uninstalling another program");
            return;
        }

        DATA["installed"].push(DATA["programs"][index]);
        print_message("Successfully installed " + program);
        control.setUpMissionMenu();

    } else if (cmd.startsWith("uninstall ")) {

        if (control.cur_scene.type == "Dungeon") {
            print_message("Can't uninstall programs while the Neural Link is connected.")
            return;
        }

        var program = cmd.slice(10),
            index = DATA["installed"].indexOf(program);
        if (index < 0) {
            print_message("Program " + program + " is not installed.");
            return;
        }

        DATA["installed"].splice(index, 1);
        print_message("Successfully uninstalled " + program);
        control.setUpMissionMenu(); // Refreshs the screen

    } else if (cmd.startsWith("sell ")) {
        if (control.cur_scene.type == "Dungeon") {
            print_message("Can't sell programs while the Neural Link is connected.")
            return;
        }
        var program = cmd.slice(5),
            index = DATA["programs"].indexOf(program),
            installed_index = DATA["installed"].indexOf(program);

        if (index < 0) {
            print_message("There's no program named " + program);
            return;
        }

        if (installed_index >= 0) {
            print_message("Uninstalling " + program);
            DATA["installed"].splice(installed_index, 1);
        }

        print_message("Sucessfully sold " + program + " for 100$")
        DATA["programs"].splice(index, 1);
        DATA["money"] += 100;
    } else if (DATA["scripts"].indexOf(cmd) >= 0) {
        index = DATA["scripts"].indexOf(cmd);
        var script = SCRIPTS[cmd];
        if (DATA["processing"] >= script["cost"]) {
            print_message(script["msg"]);
            script["run"](control.cur_scene.dungeon);
            DATA["processing"] -= script["cost"];
        } else {
            print_message("Not enough processing power to run the script.")
        }

        control.cur_scene.dungeon.executeTurn();
    }
}