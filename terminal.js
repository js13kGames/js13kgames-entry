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
    var text = terminal_input.value;
    print_message(">>> " + text)
    control.cur_scene.execute_command(text);
    terminal_input.value = "";
    if (text == "help") {
        print_message(commandlist["help"]);
    }
    if (text == "ls") {
        print_message(commandlist["ls"]);
    }
    if (text == "ls programs" || text == "ls programs/") {
        print_message("Available programs:");
        print_message();
    }
    previous_commands.push(text);
}