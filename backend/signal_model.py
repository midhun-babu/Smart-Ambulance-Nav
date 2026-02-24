def update_signals(signals):
    """Tick the state machine for traffic signals (1 second per tick roughly in real time, or simulation step)."""
    for s in signals:
        if s["timer"] > 0:
            s["timer"] -= 1
        else:
            # Transition state
            if s["state"] == "PREEMPTED_GREEN":
                # Failsafe / Clean window over -> Revert to RED
                s["state"] = "RED"
                s["timer"] = 30
            elif s["state"] == "RED":
                s["state"] = "GREEN"
                s["timer"] = 40
            elif s["state"] == "GREEN":
                s["state"] = "YELLOW"
                s["timer"] = 5
            elif s["state"] == "YELLOW":
                s["state"] = "RED"
                s["timer"] = 30

def trigger_preemption(s):
    """Set signal to Preempted Green mode for a fixed Clean Window."""
    if s["state"] != "PREEMPTED_GREEN":
        s["state"] = "PREEMPTED_GREEN"
        s["timer"] = 25 # 25 seconds clean window
        return True
    return False
