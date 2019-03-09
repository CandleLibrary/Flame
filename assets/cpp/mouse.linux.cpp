// hello.cc using N-API
#include <node_api.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>

char* display_name;
Display* display;
int screen;

namespace flaming_mouse {

  napi_value Method(napi_env env, napi_callback_info args) {
    napi_value greeting;
    napi_status status;

    int win_x, win_y, root_x, root_y = 0;
    unsigned int mask = 0;
    Window child_win, root_win;

    XQueryPointer(display, XRootWindow(display, screen),
        &child_win, &root_win,
        &root_x, &root_y, &win_x, &win_y, &mask);

    unsigned long pos = (uint) (root_x << 16) | root_y;

    status = napi_create_int64(env,  pos, &greeting);

    if (status != napi_ok) return nullptr;

    return greeting;
  }

  napi_value init(napi_env env, napi_value exports) {

    display_name = getenv("DISPLAY");
    display = XOpenDisplay(display_name);
    napi_status status;
    napi_value fn;

    status = napi_create_function(env, nullptr, 0, Method, nullptr, &fn);
    if (status != napi_ok) return nullptr;

    status = napi_set_named_property(env, exports, "mouse_pos", fn);
    if (status != napi_ok) return nullptr;
    return exports;
  }

  NAPI_MODULE(NODE_GYP_MODULE_NAME, init)

}  // namespace demo
