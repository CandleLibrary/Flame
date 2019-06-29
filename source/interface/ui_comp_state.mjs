// Tracks components position, marks active components

export default function ui_comp_state(env, components = [], active = null) {
    return {
        addComponent(component) {
            for (let i = 0; i < components.length; i++) {
                if (components[i] == component) {
                    return this;
                }
            }

            const comps = components.slice();

            comps.push(component);

            return ui_comp_state(env, comps, active);
        },

        removeComponent(component) {
            for (let i = 0; i < components.length; i++) {
                if (components[i] == component) {
                    const comps = components.slice();
                    comps.splice(i, 1);
                    return ui_comp_state(env, comps, (active == component) ? null : active);
                }
            }

            return this;
        },

        setActive(active = null) {
            if((!active || !active.component || !active.element) && active)
                return ui_comp_state(env, components, null);

            for (let i = 0; i < components.length; i++) {
                if (components[i] == active.component) {
                    return ui_comp_state(env, components, active);
                }
            }

            return this;
        },

        get active() { return active },
        get components() { return components }
    };
}
