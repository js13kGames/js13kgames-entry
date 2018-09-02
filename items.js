TRAP_LIST = ["damage", "stun", "poison"];

TRAPS = {
    "damage": function(target) { print_message("Stepped on a disconnection trap, received 3 damage.") },
    "stun": function(target) { print_message("Stepped on a disruption trap, your connection is unstable.") },
    "poison": function(target) { print_message("Stepped on a worm trap, your connection is slowly degrading.") }
};

PROGRAM_LIST = ["Maintenance", "HDD", "Proxy", "Denial_Of_Service", "Scavenger"];

PROGRAMS = {
    "Maintenance": function() {},
    "HDD": function() {},
    "Proxy": function() {},
    "Denial_Of_Service": function() {},
    "Scavenger": function() {}
}


SCRIPT_LIST = ["Scan", "Refresh", "Reconnect", "Glitch", "Decrypt", "Ping", "Interference"];