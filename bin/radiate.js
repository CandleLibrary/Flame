var radiate = (function (exports) {
    'use strict';

    const global_object = (typeof global !== "undefined") ? global : window, cfw = global_object.cfw || {};
    function addModuleToCFW(module, name) {
        if (global_object) {
            //@ts-ignore
            if (typeof global_object.cfw == "undefined") {
                //@ts-ignore
                global_object.cfw = cfw;
                //@ts-ignore
            }
            Object.defineProperty(global_object.cfw, name, { value: module, writable: false, configurable: false });
        }
    }

    const uni_id_start = [170, 181, 186, 748, 750, 895, 902, 908, 1369, 1749, 1791, 1808, 1969, 2042, 2074, 2084, 2088, 2365, 2384, 2482, 2493, 2510, 2556, 2654, 2749, 2768, 2809, 2877, 2929, 2947, 2972, 3024, 3133, 3200, 3261, 3294, 3389, 3406, 3517, 3716, 3749, 3773, 3782, 3840, 4159, 4193, 4238, 4295, 4301, 4696, 4800, 6103, 6108, 6314, 6823, 7418, 8025, 8027, 8029, 8126, 8305, 8319, 8450, 8455, 8469, 8484, 8486, 8488, 8526, 11559, 11565, 11631, 11823, 13312, 19893, 19968, 40943, 43259, 43471, 43642, 43697, 43712, 43714, 44032, 55203, 64285, 64318, 67592, 67644, 68096, 69415, 69956, 70006, 70106, 70108, 70280, 70461, 70480, 70751, 70855, 71236, 71352, 71935, 72161, 72163, 72192, 72250, 72272, 72349, 72768, 73030, 73112, 94032, 94179, 94208, 100343, 119970, 119995, 120134, 123214, 125259, 126500, 126503, 126521, 126523, 126530, 126535, 126537, 126539, 126548, 126551, 126553, 126555, 126557, 126559, 126564, 126590, 131072, 173782, 173824, 177972, 177984, 178205, 178208, 183969, 183984, 191456];
    const uni_id_start_r = [65, 90, 97, 122, 192, 214, 216, 246, 248, 705, 710, 721, 736, 740, 880, 884, 886, 887, 890, 893, 904, 906, 910, 929, 931, 1013, 1015, 1153, 1162, 1327, 1329, 1366, 1376, 1416, 1488, 1514, 1519, 1522, 1568, 1610, 1646, 1647, 1649, 1747, 1765, 1766, 1774, 1775, 1786, 1788, 1810, 1839, 1869, 1957, 1994, 2026, 2036, 2037, 2048, 2069, 2112, 2136, 2144, 2154, 2208, 2228, 2230, 2237, 2308, 2361, 2392, 2401, 2417, 2432, 2437, 2444, 2447, 2448, 2451, 2472, 2474, 2480, 2486, 2489, 2524, 2525, 2527, 2529, 2544, 2545, 2565, 2570, 2575, 2576, 2579, 2600, 2602, 2608, 2610, 2611, 2613, 2614, 2616, 2617, 2649, 2652, 2674, 2676, 2693, 2701, 2703, 2705, 2707, 2728, 2730, 2736, 2738, 2739, 2741, 2745, 2784, 2785, 2821, 2828, 2831, 2832, 2835, 2856, 2858, 2864, 2866, 2867, 2869, 2873, 2908, 2909, 2911, 2913, 2949, 2954, 2958, 2960, 2962, 2965, 2969, 2970, 2974, 2975, 2979, 2980, 2984, 2986, 2990, 3001, 3077, 3084, 3086, 3088, 3090, 3112, 3114, 3129, 3160, 3162, 3168, 3169, 3205, 3212, 3214, 3216, 3218, 3240, 3242, 3251, 3253, 3257, 3296, 3297, 3313, 3314, 3333, 3340, 3342, 3344, 3346, 3386, 3412, 3414, 3423, 3425, 3450, 3455, 3461, 3478, 3482, 3505, 3507, 3515, 3520, 3526, 3585, 3632, 3634, 3635, 3648, 3654, 3713, 3714, 3718, 3722, 3724, 3747, 3751, 3760, 3762, 3763, 3776, 3780, 3804, 3807, 3904, 3911, 3913, 3948, 3976, 3980, 4096, 4138, 4176, 4181, 4186, 4189, 4197, 4198, 4206, 4208, 4213, 4225, 4256, 4293, 4304, 4346, 4348, 4680, 4682, 4685, 4688, 4694, 4698, 4701, 4704, 4744, 4746, 4749, 4752, 4784, 4786, 4789, 4792, 4798, 4802, 4805, 4808, 4822, 4824, 4880, 4882, 4885, 4888, 4954, 4992, 5007, 5024, 5109, 5112, 5117, 5121, 5740, 5743, 5759, 5761, 5786, 5792, 5866, 5870, 5880, 5888, 5900, 5902, 5905, 5920, 5937, 5952, 5969, 5984, 5996, 5998, 6000, 6016, 6067, 6176, 6264, 6272, 6276, 6279, 6312, 6320, 6389, 6400, 6430, 6480, 6509, 6512, 6516, 6528, 6571, 6576, 6601, 6656, 6678, 6688, 6740, 6917, 6963, 6981, 6987, 7043, 7072, 7086, 7087, 7098, 7141, 7168, 7203, 7245, 7247, 7258, 7293, 7296, 7304, 7312, 7354, 7357, 7359, 7401, 7404, 7406, 7411, 7413, 7414, 7424, 7615, 7680, 7957, 7960, 7965, 7968, 8005, 8008, 8013, 8016, 8023, 8031, 8061, 8064, 8116, 8118, 8124, 8130, 8132, 8134, 8140, 8144, 8147, 8150, 8155, 8160, 8172, 8178, 8180, 8182, 8188, 8336, 8348, 8458, 8467, 8473, 8477, 8490, 8493, 8495, 8505, 8508, 8511, 8517, 8521, 8544, 8584, 11264, 11310, 11312, 11358, 11360, 11492, 11499, 11502, 11506, 11507, 11520, 11557, 11568, 11623, 11648, 11670, 11680, 11686, 11688, 11694, 11696, 11702, 11704, 11710, 11712, 11718, 11720, 11726, 11728, 11734, 11736, 11742, 12293, 12295, 12321, 12329, 12337, 12341, 12344, 12348, 12353, 12438, 12445, 12447, 12449, 12538, 12540, 12543, 12549, 12591, 12593, 12686, 12704, 12730, 12784, 12799, 40960, 42124, 42192, 42237, 42240, 42508, 42512, 42527, 42538, 42539, 42560, 42606, 42623, 42653, 42656, 42735, 42775, 42783, 42786, 42888, 42891, 42943, 42946, 42950, 42999, 43009, 43011, 43013, 43015, 43018, 43020, 43042, 43072, 43123, 43138, 43187, 43250, 43255, 43261, 43262, 43274, 43301, 43312, 43334, 43360, 43388, 43396, 43442, 43488, 43492, 43494, 43503, 43514, 43518, 43520, 43560, 43584, 43586, 43588, 43595, 43616, 43638, 43646, 43695, 43701, 43702, 43705, 43709, 43739, 43741, 43744, 43754, 43762, 43764, 43777, 43782, 43785, 43790, 43793, 43798, 43808, 43814, 43816, 43822, 43824, 43866, 43868, 43879, 43888, 44002, 55216, 55238, 55243, 55291, 63744, 64109, 64112, 64217, 64256, 64262, 64275, 64279, 64287, 64296, 64298, 64310, 64312, 64316, 64320, 64321, 64323, 64324, 64326, 64433, 64467, 64829, 64848, 64911, 64914, 64967, 65008, 65019, 65136, 65140, 65142, 65276, 65313, 65338, 65345, 65370, 65382, 65470, 65474, 65479, 65482, 65487, 65490, 65495, 65498, 65500, 65536, 65547, 65549, 65574, 65576, 65594, 65596, 65597, 65599, 65613, 65616, 65629, 65664, 65786, 65856, 65908, 66176, 66204, 66208, 66256, 66304, 66335, 66349, 66378, 66384, 66421, 66432, 66461, 66464, 66499, 66504, 66511, 66513, 66517, 66560, 66717, 66736, 66771, 66776, 66811, 66816, 66855, 66864, 66915, 67072, 67382, 67392, 67413, 67424, 67431, 67584, 67589, 67594, 67637, 67639, 67640, 67647, 67669, 67680, 67702, 67712, 67742, 67808, 67826, 67828, 67829, 67840, 67861, 67872, 67897, 67968, 68023, 68030, 68031, 68112, 68115, 68117, 68119, 68121, 68149, 68192, 68220, 68224, 68252, 68288, 68295, 68297, 68324, 68352, 68405, 68416, 68437, 68448, 68466, 68480, 68497, 68608, 68680, 68736, 68786, 68800, 68850, 68864, 68899, 69376, 69404, 69424, 69445, 69600, 69622, 69635, 69687, 69763, 69807, 69840, 69864, 69891, 69926, 69968, 70002, 70019, 70066, 70081, 70084, 70144, 70161, 70163, 70187, 70272, 70278, 70282, 70285, 70287, 70301, 70303, 70312, 70320, 70366, 70405, 70412, 70415, 70416, 70419, 70440, 70442, 70448, 70450, 70451, 70453, 70457, 70493, 70497, 70656, 70708, 70727, 70730, 70784, 70831, 70852, 70853, 71040, 71086, 71128, 71131, 71168, 71215, 71296, 71338, 71424, 71450, 71680, 71723, 71840, 71903, 72096, 72103, 72106, 72144, 72203, 72242, 72284, 72329, 72384, 72440, 72704, 72712, 72714, 72750, 72818, 72847, 72960, 72966, 72968, 72969, 72971, 73008, 73056, 73061, 73063, 73064, 73066, 73097, 73440, 73458, 73728, 74649, 74752, 74862, 74880, 75075, 77824, 78894, 82944, 83526, 92160, 92728, 92736, 92766, 92880, 92909, 92928, 92975, 92992, 92995, 93027, 93047, 93053, 93071, 93760, 93823, 93952, 94026, 94099, 94111, 94176, 94177, 100352, 101106, 110592, 110878, 110928, 110930, 110948, 110951, 110960, 111355, 113664, 113770, 113776, 113788, 113792, 113800, 113808, 113817, 119808, 119892, 119894, 119964, 119966, 119967, 119973, 119974, 119977, 119980, 119982, 119993, 119997, 120003, 120005, 120069, 120071, 120074, 120077, 120084, 120086, 120092, 120094, 120121, 120123, 120126, 120128, 120132, 120138, 120144, 120146, 120485, 120488, 120512, 120514, 120538, 120540, 120570, 120572, 120596, 120598, 120628, 120630, 120654, 120656, 120686, 120688, 120712, 120714, 120744, 120746, 120770, 120772, 120779, 123136, 123180, 123191, 123197, 123584, 123627, 124928, 125124, 125184, 125251, 126464, 126467, 126469, 126495, 126497, 126498, 126505, 126514, 126516, 126519, 126541, 126543, 126545, 126546, 126561, 126562, 126567, 126570, 126572, 126578, 126580, 126583, 126585, 126588, 126592, 126601, 126603, 126619, 126625, 126627, 126629, 126633, 126635, 126651];
    const uni_id_cont = [95, 1471, 1479, 1648, 1809, 2045, 2492, 2519, 2558, 2620, 2641, 2677, 2748, 2876, 2946, 3031, 3260, 3415, 3530, 3542, 3633, 3761, 3893, 3895, 3897, 4038, 6109, 6313, 7405, 7412, 8276, 8417, 11647, 42607, 43010, 43014, 43019, 43493, 43587, 43696, 43713, 64286, 65343, 66045, 66272, 68159, 70003, 70206, 70487, 70750, 72164, 72263, 73018, 73031, 94031, 121461, 121476];
    const uni_id_cont_r = [48, 57, 768, 879, 1155, 1159, 1425, 1469, 1473, 1474, 1476, 1477, 1552, 1562, 1611, 1641, 1750, 1756, 1759, 1764, 1767, 1768, 1770, 1773, 1776, 1785, 1840, 1866, 1958, 1968, 1984, 1993, 2027, 2035, 2070, 2073, 2075, 2083, 2085, 2087, 2089, 2093, 2137, 2139, 2259, 2273, 2275, 2307, 2362, 2364, 2366, 2383, 2385, 2391, 2402, 2403, 2406, 2415, 2433, 2435, 2494, 2500, 2503, 2504, 2507, 2509, 2530, 2531, 2534, 2543, 2561, 2563, 2622, 2626, 2631, 2632, 2635, 2637, 2662, 2673, 2689, 2691, 2750, 2757, 2759, 2761, 2763, 2765, 2786, 2787, 2790, 2799, 2810, 2815, 2817, 2819, 2878, 2884, 2887, 2888, 2891, 2893, 2902, 2903, 2914, 2915, 2918, 2927, 3006, 3010, 3014, 3016, 3018, 3021, 3046, 3055, 3072, 3076, 3134, 3140, 3142, 3144, 3146, 3149, 3157, 3158, 3170, 3171, 3174, 3183, 3201, 3203, 3262, 3268, 3270, 3272, 3274, 3277, 3285, 3286, 3298, 3299, 3302, 3311, 3328, 3331, 3387, 3388, 3390, 3396, 3398, 3400, 3402, 3405, 3426, 3427, 3430, 3439, 3458, 3459, 3535, 3540, 3544, 3551, 3558, 3567, 3570, 3571, 3636, 3642, 3655, 3662, 3664, 3673, 3764, 3772, 3784, 3789, 3792, 3801, 3864, 3865, 3872, 3881, 3902, 3903, 3953, 3972, 3974, 3975, 3981, 3991, 3993, 4028, 4139, 4158, 4160, 4169, 4182, 4185, 4190, 4192, 4194, 4196, 4199, 4205, 4209, 4212, 4226, 4237, 4239, 4253, 4957, 4959, 5906, 5908, 5938, 5940, 5970, 5971, 6002, 6003, 6068, 6099, 6112, 6121, 6155, 6157, 6160, 6169, 6277, 6278, 6432, 6443, 6448, 6459, 6470, 6479, 6608, 6617, 6679, 6683, 6741, 6750, 6752, 6780, 6783, 6793, 6800, 6809, 6832, 6845, 6912, 6916, 6964, 6980, 6992, 7001, 7019, 7027, 7040, 7042, 7073, 7085, 7088, 7097, 7142, 7155, 7204, 7223, 7232, 7241, 7248, 7257, 7376, 7378, 7380, 7400, 7415, 7417, 7616, 7673, 7675, 7679, 8255, 8256, 8400, 8412, 8421, 8432, 11503, 11505, 11744, 11775, 12330, 12335, 12441, 12442, 42528, 42537, 42612, 42621, 42654, 42655, 42736, 42737, 43043, 43047, 43136, 43137, 43188, 43205, 43216, 43225, 43232, 43249, 43263, 43273, 43302, 43309, 43335, 43347, 43392, 43395, 43443, 43456, 43472, 43481, 43504, 43513, 43561, 43574, 43596, 43597, 43600, 43609, 43643, 43645, 43698, 43700, 43703, 43704, 43710, 43711, 43755, 43759, 43765, 43766, 44003, 44010, 44012, 44013, 44016, 44025, 65024, 65039, 65056, 65071, 65075, 65076, 65101, 65103, 65296, 65305, 66422, 66426, 66720, 66729, 68097, 68099, 68101, 68102, 68108, 68111, 68152, 68154, 68325, 68326, 68900, 68903, 68912, 68921, 69446, 69456, 69632, 69634, 69688, 69702, 69734, 69743, 69759, 69762, 69808, 69818, 69872, 69881, 69888, 69890, 69927, 69940, 69942, 69951, 69957, 69958, 70016, 70018, 70067, 70080, 70089, 70092, 70096, 70105, 70188, 70199, 70367, 70378, 70384, 70393, 70400, 70403, 70459, 70460, 70462, 70468, 70471, 70472, 70475, 70477, 70498, 70499, 70502, 70508, 70512, 70516, 70709, 70726, 70736, 70745, 70832, 70851, 70864, 70873, 71087, 71093, 71096, 71104, 71132, 71133, 71216, 71232, 71248, 71257, 71339, 71351, 71360, 71369, 71453, 71467, 71472, 71481, 71724, 71738, 71904, 71913, 72145, 72151, 72154, 72160, 72193, 72202, 72243, 72249, 72251, 72254, 72273, 72283, 72330, 72345, 72751, 72758, 72760, 72767, 72784, 72793, 72850, 72871, 72873, 72886, 73009, 73014, 73020, 73021, 73023, 73029, 73040, 73049, 73098, 73102, 73104, 73105, 73107, 73111, 73120, 73129, 73459, 73462, 92768, 92777, 92912, 92916, 92976, 92982, 93008, 93017, 94033, 94087, 94095, 94098, 113821, 113822, 119141, 119145, 119149, 119154, 119163, 119170, 119173, 119179, 119210, 119213, 119362, 119364, 120782, 120831, 121344, 121398, 121403, 121452, 121499, 121503, 121505, 121519, 122880, 122886, 122888, 122904, 122907, 122913, 122915, 122916, 122918, 122922, 123184, 123190, 123200, 123209, 123628, 123641, 125136, 125142, 125252, 125258, 125264, 125273];
    ///*
    const j = new Uint16Array(100000);
    j.fill(0);
    //Add value to individual indexes
    function aii(table, value, ...indices) {
        for (const i of indices)
            table[i] |= value;
    }
    //Add value to index ranges
    function air(t, v, ...i_r) {
        for (const r of i_r.reduce((r, v, i) => (((i % 2) ? (r[r.length - 1].push(v)) : r.push([v])), r), [])) {
            const size = r[1] + 1 - r[0], a = [];
            for (let i = 0; i < size; i++)
                a[i] = r[0] + i;
            aii(t, v, ...a);
        }
    }
    //7. Symbol
    // Default Value
    //1. Identifier
    air(j, 1, ...uni_id_start_r);
    aii(j, 1, ...uni_id_start);
    //2. QUOTE STRING
    aii(j, 2, 34, 39, 96);
    //3. SPACE SET
    aii(j, 3, 32, 0xA0, 0x2002, 0x2003, 0x2004, 0x3000);
    //4. TAB SET
    aii(j, 4, 9);
    //5. CARIAGE RETURN 
    aii(j, 5, 13);
    //6. CARIAGE RETURN 
    aii(j, 6, 10);
    //7. Number
    air(j, 7, 48, 57);
    //8. Operator
    aii(j, 8, 33, 37, 38, 42, 43, 58, 60, 61, 62);
    //9. Open Bracket
    aii(j, 9, 40, 91, 123);
    //10. Close Bracket
    aii(j, 10, 41, 93, 125);
    //10. Close Bracket
    aii(j, 11, 16);
    /**
     * Lexer Number and Identifier jump table reference
     * Number are masked by 12(4|8) and Identifiers are masked by 10(2|8)
     * entries marked as `0` are not evaluated as either being in the number set or the identifier set.
     * entries marked as `2` are in the identifier set but not the number set
     * entries marked as `4` are in the number set but not the identifier set
     * entries marked as `8` are in both number and identifier sets
     * entries marked as `8` are in number, identifier, hex, bin, and oct sets;
     */
    const id = 2, num = 4, hex = 16, oct = 32, bin = 64;
    /**
     * LExer Number and Identifier jump table reference
     * Number are masked by [ 4 ] and Identifiers are masked by 6 [ 2 | 4 ]
     */
    // entries marked as `2` are in the identifier set but not the number set
    air(j, id << 8, 65, 90, 97, 122);
    air(j, id << 8, ...uni_id_start_r);
    aii(j, id << 8, ...uni_id_start);
    air(j, id << 8, ...uni_id_cont_r);
    aii(j, id << 8, ...uni_id_cont);
    //For hex numbers [AF] and [af]
    air(j, hex << 8, 65, 70, 97, 122);
    //For bin numbers [01]
    air(j, bin << 8, 48, 49);
    //For oct numbers [07]
    air(j, oct << 8, 48, 47);
    //For the whole natural digit range
    air(j, (num | hex) << 8, 48, 57);

    var TokenType;
    (function (TokenType) {
        TokenType[TokenType["number"] = 1] = "number";
        TokenType[TokenType["num"] = 1] = "num";
        TokenType[TokenType["identifier"] = 2] = "identifier";
        TokenType[TokenType["string"] = 4] = "string";
        TokenType[TokenType["white_space"] = 8] = "white_space";
        TokenType[TokenType["open_bracket"] = 16] = "open_bracket";
        TokenType[TokenType["close_bracket"] = 32] = "close_bracket";
        TokenType[TokenType["operator"] = 64] = "operator";
        TokenType[TokenType["symbol"] = 128] = "symbol";
        TokenType[TokenType["new_line"] = 256] = "new_line";
        TokenType[TokenType["data_link"] = 512] = "data_link";
        TokenType[TokenType["number_bin"] = 1025] = "number_bin";
        TokenType[TokenType["number_oct"] = 2049] = "number_oct";
        TokenType[TokenType["number_hex"] = 4097] = "number_hex";
        TokenType[TokenType["number_int"] = 8193] = "number_int";
        TokenType[TokenType["number_sci"] = 16385] = "number_sci";
        TokenType[TokenType["number_flt"] = 32769] = "number_flt";
        TokenType[TokenType["alpha_numeric"] = 3] = "alpha_numeric";
        TokenType[TokenType["white_space_new_line"] = 264] = "white_space_new_line";
        TokenType[TokenType["id"] = 2] = "id";
        TokenType[TokenType["str"] = 4] = "str";
        TokenType[TokenType["ws"] = 8] = "ws";
        TokenType[TokenType["ob"] = 16] = "ob";
        TokenType[TokenType["cb"] = 32] = "cb";
        TokenType[TokenType["op"] = 64] = "op";
        TokenType[TokenType["sym"] = 128] = "sym";
        TokenType[TokenType["nl"] = 256] = "nl";
        TokenType[TokenType["dl"] = 512] = "dl";
        TokenType[TokenType["int"] = 8193] = "int";
        TokenType[TokenType["integer"] = 8193] = "integer";
        TokenType[TokenType["bin"] = 1025] = "bin";
        TokenType[TokenType["binary"] = 1025] = "binary";
        TokenType[TokenType["oct"] = 2049] = "oct";
        TokenType[TokenType["octal"] = 2049] = "octal";
        TokenType[TokenType["hex"] = 4097] = "hex";
        TokenType[TokenType["hexadecimal"] = 4097] = "hexadecimal";
        TokenType[TokenType["flt"] = 32769] = "flt";
        TokenType[TokenType["float"] = 32769] = "float";
        TokenType[TokenType["sci"] = 16385] = "sci";
        TokenType[TokenType["scientific"] = 16385] = "scientific";
    })(TokenType || (TokenType = {}));
    var Masks;
    (function (Masks) {
        Masks[Masks["TYPE_MASK"] = 15] = "TYPE_MASK";
        Masks[Masks["PARSE_STRING_MASK"] = 16] = "PARSE_STRING_MASK";
        Masks[Masks["USE_EXTENDED_NUMBER_TYPES_MASK"] = 2] = "USE_EXTENDED_NUMBER_TYPES_MASK";
        Masks[Masks["IGNORE_WHITESPACE_MASK"] = 32] = "IGNORE_WHITESPACE_MASK";
        Masks[Masks["CHARACTERS_ONLY_MASK"] = 64] = "CHARACTERS_ONLY_MASK";
        Masks[Masks["USE_EXTENDED_ID_MASK"] = 128] = "USE_EXTENDED_ID_MASK";
        Masks[Masks["TOKEN_LENGTH_MASK"] = 4294967040] = "TOKEN_LENGTH_MASK";
    })(Masks || (Masks = {}));
    //De Bruijn Sequence for finding index of right most bit set.
    //http://supertech.csail.mit.edu/papers/debruijn.pdf
    const arrow = String.fromCharCode(0x2b89), line = String.fromCharCode(0x2500), thick_line = String.fromCharCode(0x2501), HORIZONTAL_TAB = 9, SPACE = 32, extended_jump_table = j.slice();
    extended_jump_table[45] |= 2 << 8;
    extended_jump_table[95] |= 2 << 8;
    /**
     * Partially configurable token producing lexer.
     */
    class Lexer {
        /**
         *
         * @param string
         * @param INCLUDE_WHITE_SPACE_TOKENS
         * @param PEEKING
         */
        constructor(string = "", INCLUDE_WHITE_SPACE_TOKENS = false, PEEKING = false) {
            if (typeof (string) !== "string")
                throw new Error(`String value must be passed to Lexer. A ${typeof (string)} was passed as the \`string\` argument.`);
            Object.defineProperties(this, {
                symbol_map: {
                    writable: true,
                    value: null
                },
                // Reference to the peeking Lexer.
                p: {
                    writable: true,
                    value: null
                },
                //Stores values accessed through binary operations
                masked_values: {
                    writable: true,
                    value: 0
                },
                //  The length of the string being parsed. Can be adjusted to virtually shorten the screen. 
                sl: {
                    writable: true,
                    enumerable: true,
                    value: string.length
                },
                //  The string that the Lexer tokenizes.
                str: {
                    writable: false,
                    value: string
                }
            });
            /**
             * The type id of the current token.
             */
            this.type = 262144; //Default "non-value" for types is 1<<18;
            /**
             * The offset in the string of the start of the current token.
             */
            this.off = 0;
            /**
             * The character offset of the current token within a line.
             */
            this.char = 0;
            /**
             * The line position of the current token.
             */
            this.line = 0;
            /**
             * The length of the current token.
             */
            this.tl = 0;
            /**
             * Flag to ignore white spaced.
             */
            this.IWS = !INCLUDE_WHITE_SPACE_TOKENS;
            this.USE_EXTENDED_ID = false;
            /**
             * Flag to force the lexer to parse string contents
             * instead of producing a token that is a substring matched
             * by /["''].*["'']/
             */
            this.PARSE_STRING = false;
            if (!PEEKING)
                this.next();
        }
        /**
         * Restore the Lexer back to it's initial state.
         * @public
         */
        reset() {
            this.p = null;
            this.type = 32768;
            this.off = 0;
            this.tl = 0;
            this.char = 0;
            this.line = 0;
            this.n;
            return this;
        }
        resetHead() {
            this.off = 0;
            this.tl = 0;
            this.char = 0;
            this.line = 0;
            this.p = null;
            this.type = 32768;
        }
        ;
        /**
         * Copies the data to a new Lexer object.
         * @return {Lexer}  Returns a new Lexer instance with the same property values.
         */
        copy(destination = new Lexer(this.str, false, true)) {
            destination.off = this.off;
            destination.char = this.char;
            destination.line = this.line;
            destination.sl = this.sl;
            destination.tl = this.tl;
            destination.type = this.type;
            destination.symbol_map = this.symbol_map;
            destination.masked_values = this.masked_values;
            return destination;
        }
        /**
         * Given another Lexer with the same `str` property value, it will copy the state of that Lexer.
         * @param      {Lexer}  [marker=this.peek]  The Lexer to clone the state from.
         * @throws     {Error} Throws an error if the Lexers reference different strings.
         * @public
         */
        sync(marker = this.p) {
            if (marker instanceof Lexer) {
                if (marker.str !== this.str)
                    throw new Error("Cannot sync Lexers with different strings!");
                this.off = marker.off;
                this.char = marker.char;
                this.line = marker.line;
                this.masked_values = marker.masked_values;
            }
            return this;
        }
        /**
         * Sets the internal state to point to the next token. Sets Lexer.prototype.END to `true` if the end of the string is hit.
         * @public
         * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
         */
        next(marker = this, USE_CUSTOM_SYMBOLS = !!this.symbol_map) {
            if (marker.sl < 1) {
                marker.off = 0;
                marker.type = 32768;
                marker.tl = 0;
                marker.line = 0;
                marker.char = 0;
                return marker;
            }
            //Token builder
            const l = marker.sl, str = marker.str, jump_table = this.id_lu, IWS = marker.IWS;
            let length = marker.tl, off = marker.off + length, type = TokenType.symbol, line = marker.line, base = off, char = marker.char, root = marker.off;
            if (off >= l) {
                length = 0;
                base = l;
                //char -= base - off;
                marker.char = char + (base - marker.off);
                marker.type = type;
                marker.off = base;
                marker.tl = 0;
                marker.line = line;
                return marker;
            }
            let NORMAL_PARSE = true;
            if (USE_CUSTOM_SYMBOLS) {
                let code = str.charCodeAt(off);
                let off2 = off;
                let map = this.symbol_map, m;
                while (code == 32 && IWS)
                    (code = str.charCodeAt(++off2), off++);
                while ((m = map.get(code))) {
                    map = m;
                    off2 += 1;
                    code = str.charCodeAt(off2);
                }
                if (map.IS_SYM) {
                    NORMAL_PARSE = false;
                    base = off;
                    length = off2 - off;
                }
            }
            while (NORMAL_PARSE) {
                base = off;
                length = 1;
                const code = str.codePointAt(off);
                switch (jump_table[code] & 255) {
                    case 0: //SYMBOL
                        type = TokenType.symbol;
                        break;
                    case 1: //IDENTIFIER
                        while (++off < l && (((id | num) & (jump_table[str.codePointAt(off)] >> 8))))
                            ;
                        type = TokenType.identifier;
                        length = off - base;
                        break;
                    case 2: //QUOTED STRING
                        if (this.PARSE_STRING) {
                            type = TokenType.symbol;
                        }
                        else {
                            while (++off < l && str.codePointAt(off) !== code)
                                ;
                            type = TokenType.string;
                            length = off - base + 1;
                        }
                        break;
                    case 3: //SPACE SET
                        while (++off < l && str.codePointAt(off) === SPACE)
                            ;
                        type = TokenType.white_space;
                        length = off - base;
                        break;
                    case 4: //TAB SET
                        while (++off < l && str[off] === "\t")
                            ;
                        type = TokenType.white_space;
                        length = off - base;
                        break;
                    case 5: //CARIAGE RETURN
                        length = 2;
                    //intentional
                    case 6: //LINEFEED
                        type = TokenType.new_line;
                        line++;
                        base = off;
                        root = off;
                        off += length;
                        char = 0;
                        break;
                    case 7: //NUMBER
                        type = TokenType.number;
                        //Check for binary, hexidecimal, and octal representation
                        if (code == 48) { // 0 - ZERO
                            off++;
                            if (("oxbOXB").includes(str[off])) {
                                const lups = { b: { lu: bin, ty: TokenType.number_bin }, o: { lu: oct, ty: TokenType.number_oct }, x: { lu: hex, ty: TokenType.number_hex } };
                                const { lu, ty } = lups[str[off].toLowerCase()];
                                //Code of first char after the letter should
                                // be within the range of the respective lu type : hex, oct, or bin
                                if ((lu & (jump_table[str.codePointAt(off + 1)] >> 8))) {
                                    while (++off < l && (lu & (jump_table[str.codePointAt(off)] >> 8)))
                                        ;
                                    type = ty;
                                }
                                //return just the 0
                            }
                            //The number is just 0. Do not allow 0221, 00007, etc.
                        }
                        else {
                            while (++off < l && (num & (jump_table[str.codePointAt(off)] >> 8)))
                                ;
                            //type = number_int;
                            if (str[off] == ".") {
                                while (++off < l && (num & (jump_table[str.codePointAt(off)] >> 8)))
                                    ;
                                //float
                                type = TokenType.number_flt;
                            }
                            if (("Ee").includes(str[off])) {
                                const ori_off = off;
                                //Add e to the number string
                                off++;
                                if (("-+").includes(str[off]))
                                    off++;
                                if (!(num & (jump_table[str.codePointAt(off)] >> 8))) {
                                    off = ori_off;
                                }
                                else {
                                    while (++off < l && (num & (jump_table[str.codePointAt(off)] >> 8)))
                                        ;
                                    type = TokenType.number_sci;
                                }
                                //scientific 
                            }
                        }
                        if (!this.USE_EXTENDED_NUMBER_TYPES)
                            type = TokenType.number;
                        length = off - base;
                        break;
                    case 8: //OPERATOR
                        type = TokenType.operator;
                        break;
                    case 9: //OPEN BRACKET
                        type = TokenType.open_bracket;
                        break;
                    case 10: //CLOSE BRACKET
                        type = TokenType.close_bracket;
                        break;
                    case 11: //Data Link Escape
                        type = TokenType.data_link;
                        length = 4; //Stores two UTF16 values and a data link sentinel
                        break;
                }
                if (IWS && (type & TokenType.white_space_new_line)) {
                    if (off < l) {
                        type = TokenType.symbol;
                        //off += length;
                        continue;
                    }
                    else {
                        //Trim white space from end of string
                        base = l - off;
                        marker.sl -= off;
                        length = 0;
                    }
                }
                break;
            }
            marker.type = type;
            marker.off = base;
            marker.tl = (this.masked_values & Masks.CHARACTERS_ONLY_MASK) ? Math.min(1, length) : length;
            marker.char = char + base - root;
            marker.line = line;
            return marker;
        }
        /**
         * Restricts max parse distance to the other Lexer's current position.
         * @param      {Lexer}  Lexer   The Lexer to limit parse distance by.
         */
        fence(marker = this) {
            if (marker.str !== this.str)
                return;
            this.sl = marker.off;
            return this;
        }
        /**
            Looks for the string within the text and returns a new lexer at the location of the first occurance of the token or
        */
        find(string) {
            const cp = this.pk, match = this.copy();
            match.resetHead();
            match.str = string;
            match.sl = string.length;
            cp.tl = 0;
            const char_cache = cp.CHARACTERS_ONLY;
            match.CHARACTERS_ONLY = true;
            cp.CHARACTERS_ONLY = true;
            while (!cp.END) {
                const mpk = match.pk, cpk = cp.pk;
                while (!mpk.END && !cpk.END && cpk.tx == mpk.tx) {
                    cpk.next();
                    mpk.next();
                }
                if (mpk.END) {
                    cp.CHARACTERS_ONLY = char_cache;
                    return cp.next();
                }
                cp.next();
            }
            return cp;
        }
        /**
         * Creates an error message with a diagram illustrating the location of the error.
         */
        errorMessage(message = "", file = "", window_size = 120, tab_size = 2) {
            window_size = 500;
            // Get the text from the proceeding and the following lines; 
            // If current line is at index 0 then there will be no proceeeding line;
            // Likewise for the following line if current line is the last one in the string.
            const line_start = this.off - this.char, char = this.char, l = this.line, str = this.str, len = str.length, sp = " ";
            let prev_start = 0, next_start = 0, next_end = 0, i = 0;
            //get the start of the proceeding line
            for (i = line_start; --i > 0 && j[str.codePointAt(i)] !== 6;)
                ;
            prev_start = i;
            //get the end of the current line...
            for (i = this.off + this.tl; i++ < len && j[str.codePointAt(i)] !== 6;)
                ;
            next_start = i;
            //and the next line
            for (; i++ < len && j[str.codePointAt(i)] !== 6;)
                ;
            next_end = i;
            let pointer_pos = char - (line_start > 0 ? 1 : 0);
            for (i = line_start; ++i < this.off;)
                if (str.codePointAt(i) == HORIZONTAL_TAB)
                    pointer_pos += tab_size - 1;
            //find the location of the offending symbol
            const prev_line = str.slice(prev_start + (prev_start > 0 ? 1 : 0), line_start).replace(/\t/g, sp.repeat(tab_size)), curr_line = str.slice(line_start + (line_start > 0 ? 1 : 0), next_start).replace(/\t/g, sp.repeat(tab_size)), next_line = str.slice(next_start + (next_start > 0 ? 1 : 0), next_end).replace(/\t/g, " "), 
            //get the max line length;
            max_length = Math.max(prev_line.length, curr_line.length, next_line.length), min_length = Math.min(prev_line.length, curr_line.length, next_line.length), length_diff = max_length - min_length, 
            //Get the window size;
            w_size = window_size, w_start = Math.max(0, Math.min(pointer_pos - w_size / 0.75, max_length)), w_end = Math.max(0, Math.min(pointer_pos + w_size / 0.25, max_length)), w_pointer_pos = Math.max(0, Math.min(pointer_pos, max_length)) - w_start, 
            //append the difference of line lengths to the end of the lines as space characers;
            prev_line_o = (prev_line + sp.repeat(length_diff)).slice(w_start, w_end), curr_line_o = (curr_line + sp.repeat(length_diff)).slice(w_start, w_end), next_line_o = (next_line + sp.repeat(length_diff)).slice(w_start, w_end), trunc = w_start !== 0 ? "... " : "", line_number = n => ` ${(sp.repeat(3) + (n + 1)).slice(-(l + 1 + "").length)}: `, error_border = thick_line.repeat(curr_line_o.length + line_number.length + 8 + trunc.length);
            return [
                `${message} at ${file ? file + ":" : ""}${l + 1}:${char + 1 - ((l > 0) ? 1 : 0)}`,
                `${error_border}`,
                `${l - 1 > -1 ? line_number(l - 1) + trunc + prev_line_o + (prev_line_o.length < prev_line.length ? " ..." : "") : ""}`,
                `${ line_number(l) + trunc + curr_line_o + (curr_line_o.length < curr_line.length ? " ..." : "") }`,
                `${line.repeat(w_pointer_pos + trunc.length + line_number(l + 1).length) + arrow}`,
                `${next_start < str.length ? line_number(l + 1) + trunc + next_line_o + (next_line_o.length < next_line.length ? " ..." : "") : ""}`,
                `${error_border}`
            ]
                .filter(e => !!e)
                .join("\n");
        }
        errorMessageWithIWS(...v) {
            return this.errorMessage(...v) + "\n" + (!this.IWS) ? "\n The Lexer produced whitespace tokens" : "";
        }
        /**
         * Will throw a new Error, appending the parsed string line and position information to the the error message passed into the function.
         * @instance
         * @public
         * @param {String} message - The error message.
         */
        throw(message) {
            throw new Error(this.errorMessage(message));
        }
        ;
        /**
         * Proxy for Lexer.prototype.reset
         * @public
         */
        r() { return this.reset(); }
        /**
         * Proxy for Lexer.prototype.assert
         * @public
         */
        a(text) {
            return this.assert(text);
        }
        /**
         * Compares the string value of the current token to the value passed in. Advances to next token if the two are equal.
         * @public
         * @throws {Error} - `Expecting "${text}" got "${this.text}"`
         * @param {String} text - The string to compare.
         */
        assert(text) {
            if (this.off < 0 || this.END)
                this.throw(`Expecting [${text}] but encountered end of string.`);
            if (this.text == text)
                this.next();
            else
                this.throw(`Expecting [${text}] but encountered [${this.text}]`);
            return this;
        }
        /**
         * Proxy for Lexer.prototype.assertCharacter
         * @public
         */
        aC(char) { return this.assertCharacter(char); }
        /**
         * Compares the character value of the current token to the value passed in. Advances to next token if the two are equal.
         * @public
         * @throws {Error} - `Expecting "${text}" got "${this.text}"`
         * @param {String} text - The string to compare.
         */
        assertCharacter(char) {
            if (this.off < 0 || this.END)
                this.throw(`Expecting [${char[0]}] but encountered end of string.`);
            if (this.ch == char[0])
                this.next();
            else
                this.throw(`Expecting [${char[0]}] but encountered [${this.ch}]`);
            return this;
        }
        /**
         * Returns the Lexer bound to Lexer.prototype.p, or creates and binds a new Lexer to Lexer.prototype.p. Advences the other Lexer to the token ahead of the calling Lexer.
         * @public
         * @type {Lexer}
         * @param {Lexer} [marker=this] - The marker to originate the peek from.
         * @param {Lexer} [peeking_marker=this.p] - The Lexer to set to the next token state.
         * @return {Lexer} - The Lexer that contains the peeked at token.
         */
        peek(marker = this, peeking_marker = this.p) {
            if (!peeking_marker) {
                if (!marker)
                    return null;
                if (!this.p) {
                    this.p = new Lexer(this.str, false, true);
                    peeking_marker = this.p;
                }
            }
            peeking_marker.masked_values = marker.masked_values;
            peeking_marker.type = marker.type;
            peeking_marker.off = marker.off;
            peeking_marker.tl = marker.tl;
            peeking_marker.char = marker.char;
            peeking_marker.line = marker.line;
            this.next(peeking_marker);
            return peeking_marker;
        }
        /**
         * Proxy for Lexer.prototype.slice
         * @public
         */
        s(start) { return this.slice(start); }
        /**
         * Returns a slice of the parsed string beginning at `start` and ending at the current token.
         * @param {Number | LexerBeta} start - The offset in this.str to begin the slice. If this value is a LexerBeta, sets the start point to the value of start.off.
         * @return {String} A substring of the parsed string.
         * @public
         */
        slice(start = this.off) {
            if (start instanceof Lexer)
                start = start.off;
            return this.str.slice(start, (this.off <= start) ? this.sl : this.off);
        }
        /**
         * Skips to the end of a comment section.
         * @param {boolean} ASSERT - If set to true, will through an error if there is not a comment line or block to skip.
         * @param {Lexer} [marker=this] - If another Lexer is passed into this method, it will advance the token state of that Lexer.
         */
        comment(ASSERT = false, marker = this) {
            if (!(marker instanceof Lexer))
                return marker;
            if (marker.ch == "/") {
                if (marker.pk.ch == "*") {
                    marker.sync();
                    //@ts-ignore
                    while (!marker.END && (marker.next().ch !== "*" || marker.pk.ch !== "/")) { /** NO OP */ }
                    marker.sync().assert("/");
                }
                else if (marker.pk.ch == "/") {
                    const IWS = marker.IWS;
                    while (marker.next().ty != TokenType.new_line && !marker.END) { /** NO OP */ }
                    marker.IWS = IWS;
                    marker.next();
                }
                else if (ASSERT)
                    marker.throw("Expecting the start of a comment");
            }
            return marker;
        }
        /**
         * Replaces the string the Lexer is tokenizing.
         * @param string - New string to replace the existing one with.
         * @param RESET - Flag that if set true will reset the Lexers position to the start of the string
         */
        setString(string, RESET = true) {
            this.str = string;
            this.sl = string.length;
            if (RESET)
                this.resetHead();
        }
        ;
        toString() {
            return this.slice();
        }
        /**
         * Returns new Whind Lexer that has leading and trailing whitespace characters removed from input.
         * @param leave_leading_amount - Maximum amount of leading space caracters to leave behind. Default is zero
         * @param leave_trailing_amount - Maximum amount of trailing space caracters to leave behind. Default is zero
         */
        trim(leave_leading_amount = 0, leave_trailing_amount = leave_leading_amount) {
            const lex = this.copy();
            let space_count = 0, off = lex.off;
            for (; lex.off < lex.sl; lex.off++) {
                const c = j[lex.string.charCodeAt(lex.off)];
                if (c > 2 && c < 7) {
                    if (space_count >= leave_leading_amount) {
                        off++;
                    }
                    else {
                        space_count++;
                    }
                    continue;
                }
                break;
            }
            lex.off = off;
            space_count = 0;
            off = lex.sl;
            for (; lex.sl > lex.off; lex.sl--) {
                const c = j[lex.string.charCodeAt(lex.sl - 1)];
                if (c > 2 && c < 7) {
                    if (space_count >= leave_trailing_amount) {
                        off--;
                    }
                    else {
                        space_count++;
                    }
                    continue;
                }
                break;
            }
            lex.sl = off;
            if (leave_leading_amount > 0)
                lex.IWS = false;
            lex.tl = 0;
            lex.next();
            return lex;
        }
        /**
         * Adds symbol to symbol_map. This allows custom symbols to be defined and tokenized by parser.
        */
        addSymbol(sym) {
            if (!this.symbol_map)
                this.symbol_map = new Map;
            let map = this.symbol_map;
            for (let i = 0; i < sym.length; i++) {
                let code = sym.charCodeAt(i);
                let m = map.get(code);
                if (!m) {
                    m = map.set(code, new Map).get(code);
                }
                map = m;
            }
            map.IS_SYM = true;
        }
        /** Getters and Setters ***/
        get string() {
            return this.str;
        }
        get string_length() {
            return this.sl - this.off;
        }
        set string_length(s) { }
        /**
         * The current token in the form of a new Lexer with the current state.
         * Proxy property for Lexer.prototype.copy
         * @type {Lexer}
         * @public
         * @readonly
         */
        get token() {
            return this.copy();
        }
        get ch() {
            return this.str[this.off];
        }
        /**
         * Proxy for Lexer.prototype.text
         * @public
         * @type {String}
         * @readonly
         */
        get tx() { return this.text; }
        /**
         * The string value of the current token.
         * @type {string}
         * @public
         * @readonly
         */
        get text() {
            return (this.off < 0) ? "" : this.str.slice(this.off, this.off + this.tl);
        }
        /**
         * The type id of the current token.
         * @type {TokenType}
         * @public
         * @readonly
         */
        get ty() { return this.type; }
        ;
        /**
         * The current token's offset position from the start of the string.
         * @type {Number}
         * @public
         * @readonly
         */
        get pos() {
            return this.off;
        }
        /**
         * Proxy for Lexer.prototype.peek
         * @public
         * @readonly
         * @type {Lexer}
         */
        get pk() { return this.peek(); }
        /**
         * Proxy for Lexer.prototype.next
         * @public
         */
        get n() { return this.next(); }
        /**
         * Boolean value set to true if position of Lexer is at the end of the string.
         */
        get END() { return this.off >= this.sl; }
        set END(v) { }
        get IGNORE_WHITE_SPACE() {
            return this.IWS;
        }
        set IGNORE_WHITE_SPACE(bool) {
            this.IWS = !!bool;
        }
        get CHARACTERS_ONLY() {
            return !!(this.masked_values & Masks.CHARACTERS_ONLY_MASK);
        }
        set CHARACTERS_ONLY(boolean) {
            this.masked_values = (this.masked_values & ~Masks.CHARACTERS_ONLY_MASK) | ((+boolean | 0) << 6);
        }
        get IWS() {
            return !!(this.masked_values & Masks.IGNORE_WHITESPACE_MASK);
        }
        set IWS(boolean) {
            this.masked_values = (this.masked_values & ~Masks.IGNORE_WHITESPACE_MASK) | ((+boolean | 0) << 5);
        }
        get PARSE_STRING() {
            return !!(this.masked_values & Masks.PARSE_STRING_MASK);
        }
        set PARSE_STRING(boolean) {
            this.masked_values = (this.masked_values & ~Masks.PARSE_STRING_MASK) | ((+boolean | 0) << 4);
        }
        get USE_EXTENDED_ID() {
            return !!(this.masked_values & Masks.USE_EXTENDED_ID_MASK);
        }
        set USE_EXTENDED_ID(boolean) {
            this.masked_values = (this.masked_values & ~Masks.USE_EXTENDED_ID_MASK) | ((+boolean | 0) << 8);
        }
        get USE_EXTENDED_NUMBER_TYPES() {
            return !!(this.masked_values & Masks.USE_EXTENDED_NUMBER_TYPES_MASK);
        }
        set USE_EXTENDED_NUMBER_TYPES(boolean) {
            this.masked_values = (this.masked_values & ~Masks.USE_EXTENDED_NUMBER_TYPES_MASK) | ((+boolean | 0) << 2);
        }
        /**
         * Reference to token id types.
         */
        get types() {
            return TokenType;
        }
    }
    Lexer.prototype.id_lu = j;
    Lexer.prototype.addCharacter = Lexer.prototype.addSymbol;
    function whind(string, INCLUDE_WHITE_SPACE_TOKENS = false) { return new Lexer(string, INCLUDE_WHITE_SPACE_TOKENS); }
    whind.constructor = Lexer;
    Lexer.types = TokenType;
    whind.types = TokenType;

    const uri_reg_ex = /(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:\/\/))?(?:([a-zA-Z][\dA-Za-z\+\.\-]*)(?:\:([^\<\>\:\?\[\]\@\/\#\b\s]*)?)?\@)?(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|((?:\[[0-9a-f]{1,4})+(?:\:[0-9a-f]{0,4}){2,7}\])|([^\<\>\:\?\[\]\@\/\#\b\s\.]{2,}(?:\.[^\<\>\:\?\[\]\@\/\#\b\s]*)*))?(?:\:(\d+))?((?:[^\?\[\]\#\s\b]*)+)?(?:\?([^\[\]\#\s\b]*))?(?:\#([^\#\s\b]*))?/i;

    const STOCK_LOCATION = {
        protocol: "",
        host: "",
        port: "",
        path: "",
        hash: "",
        query: "",
        search: ""
    };

    function getCORSModes(url) {
        const IS_CORS = (URL.G.host !== url.host && !!url.host);
        return {
            IS_CORS,
            mode: IS_CORS ? "cors" : "same-origin", // CORs not allowed
            credentials: IS_CORS ? "omit" : "include",
        }
    }

    function fetchLocalText(url, m = "cors") {

        return new Promise((res, rej) => {
            fetch(url + "", Object.assign({
                method: "GET"
            }, getCORSModes(url))).then(r => {

                if (r.status < 200 || r.status > 299)
                    r.text().then(rej);
                else
                    r.text().then(res);
            }).catch(e => rej(e));
        });
    }

    function fetchLocalJSON(url, m = "cors") {
        return new Promise((res, rej) => {
            fetch(url + "", Object.assign({
                method: "GET"
            }, getCORSModes(url))).then(r => {
                if (r.status < 200 || r.status > 299)
                    r.json().then(rej);
                else
                    r.json().then(res).catch(rej);
            }).catch(e => rej(e));
        });
    }

    function submitForm(url, form_data, m = "same-origin") {
        return new Promise((res, rej) => {
            var form;

            if (form_data instanceof FormData)
                form = form_data;
            else {
                form = new FormData();
                for (let name in form_data)
                    form.append(name, form_data[name] + "");
            }

            fetch(url + "", Object.assign({
                method: "POST",
                body: form
            }, getCORSModes(url))).then(r => {
                if (r.status < 200 || r.status > 299)
                    r.text().then(rej);
                else
                    r.json().then(res);
            }).catch(e => e.text().then(rej));
        });
    }

    function submitJSON(url, json_data, m = "same-origin") {
        return new Promise((res, rej) => {
            fetch(url + "", Object.assign({
                method: "POST",
                body: JSON.stringify(json_data),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }, getCORSModes(url))).then(r => {
                if (r.status < 200 || r.status > 299)
                    r.json().then(rej);
                else
                    r.json().then(res);
            }).catch(e => e.text().then(rej));
        });
    }



    /**
     * Used for processing URLs, handling `document.location`, and fetching data.
     * @param      {string}   url           The URL string to wrap.
     * @param      {boolean}  USE_LOCATION  If `true` missing URL parts are filled in with data from `document.location`. 
     * @return     {URL}   If a falsy value is passed to `url`, and `USE_LOCATION` is `true` a Global URL is returned. This is directly linked to the page and will _update_ the actual page URL when its values are change. Use with caution. 
     * @alias URL
     * @memberof module:wick.core.network
     */
    class URL {

        static resolveRelative(URL_or_url_new, URL_or_url_original = (URL.G) ? URL.G : (typeof document != "undefined" && typeof document.location != "undefined") ? document.location.toString() : null) {

            let URL_old = (URL_or_url_original instanceof URL) ? URL_or_url_original : new URL(URL_or_url_original);
            let URL_new = (URL_or_url_new instanceof URL) ? URL_or_url_new : new URL(URL_or_url_new);

            if (!(URL_old + "") || !(URL_new + "")) return null;
            if (URL_new.path[0] != "/") {

                let a = URL_old.path.split("/");
                let b = URL_new.path.split("/");


                if (b[0] == "..") a.splice(a.length - 1, 1);
                for (let i = 0; i < b.length; i++) {
                    switch (b[i]) {
                        case "..":
                        case ".":
                            a.splice(a.length - 1, 1);
                            break;
                        default:
                            a.push(b[i]);
                    }
                }
                URL_new.path = a.join("/");
            }
            return URL_new;
        }

        constructor(url = "", USE_LOCATION = false) {

            let IS_STRING = true,
                IS_LOCATION = false;


            let location = (typeof(document) !== "undefined") ? document.location : STOCK_LOCATION;

            if (typeof(Location) !== "undefined" && url instanceof Location) {
                location = url;
                url = "";
                IS_LOCATION = true;
            }
            if (!url || typeof(url) != "string") {
                IS_STRING = false;
                IS_LOCATION = true;
                if (URL.GLOBAL && USE_LOCATION)
                    return URL.GLOBAL;
            }

            /**
             * URL protocol
             */
            this.protocol = "";

            /**
             * Username string
             */
            this.user = "";

            /**
             * Password string
             */
            this.pwd = "";

            /**
             * URL hostname
             */
            this.host = "";

            /**
             * URL network port number.
             */
            this.port = 0;

            /**
             * URL resource path
             */
            this.path = "";

            /**
             * URL query string.
             */
            this.query = "";

            /**
             * Hashtag string
             */
            this.hash = "";

            /**
             * Map of the query data
             */
            this.map = null;

            if (IS_STRING) {
                if (url instanceof URL) {
                    this.protocol = url.protocol;
                    this.user = url.user;
                    this.pwd = url.pwd;
                    this.host = url.host;
                    this.port = url.port;
                    this.path = url.path;
                    this.query = url.query;
                    this.hash = url.hash;
                } else {
                    let part = url.match(uri_reg_ex);

                    //If the complete string is not matched than we are dealing with something other 
                    //than a pure URL. Thus, no object is returned. 
                    if (part[0] !== url) return null;

                    this.protocol = part[1] || ((USE_LOCATION) ? location.protocol : "");
                    this.user = part[2] || "";
                    this.pwd = part[3] || "";
                    this.host = part[4] || part[5] || part[6] || ((USE_LOCATION) ? location.hostname : "");
                    this.port = parseInt(part[7] || ((USE_LOCATION) ? location.port : 0));
                    this.path = part[8] || ((USE_LOCATION) ? location.pathname : "");
                    this.query = part[9] || ((USE_LOCATION) ? location.search.slice(1) : "");
                    this.hash = part[10] || ((USE_LOCATION) ? location.hash.slice(1) : "");

                }
            } else if (IS_LOCATION && location) {
                this.protocol = location.protocol.replace(/\:/g, "");
                this.host = location.hostname;
                this.port = location.port;
                this.path = location.pathname;
                this.hash = location.hash.slice(1);
                this.query = location.search.slice(1);
                this._getQuery_(this.query);

                if (USE_LOCATION) {
                    URL.G = this;
                    return URL.R;
                }
            }
            this._getQuery_(this.query);
        }


        /**
        URL Query Syntax

        root => [root_class] [& [class_list]]
             => [class_list]

        root_class = key_list

        class_list [class [& key_list] [& class_list]]

        class => name & key_list

        key_list => [key_val [& key_list]]

        key_val => name = val

        name => ALPHANUMERIC_ID

        val => NUMBER
            => ALPHANUMERIC_ID
        */

        /**
         * Pulls query string info into this.map
         * @private
         */
        _getQuery_() {
            let map = (this.map) ? this.map : (this.map = new Map());

            let lex = whind(this.query);


            const get_map = (k, m) => (m.has(k)) ? m.get(k) : m.set(k, new Map).get(k);

            let key = 0,
                key_val = "",
                class_map = get_map(key_val, map),
                lfv = 0;

            while (!lex.END) {
                switch (lex.tx) {
                    case "&": //At new class or value
                        if (lfv > 0)
                            key = (class_map.set(key_val, lex.s(lfv)), lfv = 0, lex.n.pos);
                        else {
                            key_val = lex.s(key);
                            key = (class_map = get_map(key_val, map), lex.n.pos);
                        }
                        continue;
                    case "=":
                        //looking for a value now
                        key_val = lex.s(key);
                        lfv = lex.n.pos;
                        continue;
                }
            }

            if (lfv > 0) class_map.set(key_val, lex.s(lfv));
        }

        setPath(path) {

            this.path = path;

            return new URL(this);
        }

        setLocation() {
            history.replaceState({}, "replaced state", `${this}`);
            window.onpopstate();
        }

        toString() {
            let str = [];

            if (this.host) {

                if (this.protocol)
                    str.push(`${this.protocol}://`);

                str.push(`${this.host}`);
            }

            if (this.port)
                str.push(`:${this.port}`);

            if (this.path)
                str.push(`${this.path[0] == "/" || this.path[0] == "." ? "" : "/"}${this.path}`);

            if (this.query)
                str.push(((this.query[0] == "?" ? "" : "?") + this.query));

            if (this.hash)
                str.push("#" + this.hash);


            return str.join("");
        }

        /**
         * Pulls data stored in query string into an object an returns that.
         * @param      {string}  class_name  The class name
         * @return     {object}  The data.
         */
        getData(class_name = "") {
            if (this.map) {
                let out = {};
                let _c = this.map.get(class_name);
                if (_c) {
                    for (let [key, val] of _c.entries())
                        out[key] = val;
                    return out;
                }
            }
            return null;
        }

        /**
         * Sets the data in the query string. Wick data is added after a second `?` character in the query field, and appended to the end of any existing data.
         * @param      {string}  class_name  Class name to use in query string. Defaults to root, no class 
         * @param      {object | Model | AnyModel}  data        The data
         */
        setData(data = null, class_name = "") {

            if (data) {

                let map = this.map = new Map();

                let store = (map.has(class_name)) ? map.get(class_name) : (map.set(class_name, new Map()).get(class_name));

                //If the data is a falsy value, delete the association.

                for (let n in data) {
                    if (data[n] !== undefined && typeof data[n] !== "object")
                        store.set(n, data[n]);
                    else
                        store.delete(n);
                }

                //set query
                let null_class, str = "";

                if ((null_class = map.get(""))) {
                    if (null_class.size > 0) {
                        for (let [key, val] of null_class.entries())
                            str += `&${key}=${val}`;

                    }
                }

                for (let [key, class_] of map.entries()) {
                    if (key === "")
                        continue;
                    if (class_.size > 0) {
                        str += `&${key}`;
                        for (let [key, val] of class_.entries())
                            str += `&${key}=${val}`;
                    }
                }

                str = str.slice(1);

                this.query = this.query.split("?")[0] + "?" + str;

                if (URL.G == this)
                    this.goto();
            } else {
                this.query = "";
            }

            return this;

        }

        /**
         * Fetch a string value of the remote resource. 
         * Just uses path component of URL. Must be from the same origin.
         * @param      {boolean}  [ALLOW_CACHE=true]  If `true`, the return string will be cached. If it is already cached, that will be returned instead. If `false`, a network fetch will always occur , and the result will not be cached.
         * @return     {Promise}  A promise object that resolves to a string of the fetched value.
         */
        fetchText(ALLOW_CACHE = true) {

            if (ALLOW_CACHE) {

                let resource = URL.RC.get(this.path);

                if (resource)
                    return new Promise((res) => {
                        res(resource);
                    });
            }

            return fetchLocalText(this).then(res => (URL.RC.set(this.path, res), res));
        }

        /**
         * Fetch a JSON value of the remote resource. 
         * Just uses path component of URL. Must be from the same origin.
         * @param      {boolean}  [ALLOW_CACHE=true]  If `true`, the return string will be cached. If it is already cached, that will be returned instead. If `false`, a network fetch will always occur , and the result will not be cached.
         * @return     {Promise}  A promise object that resolves to a string of the fetched value.
         */
        fetchJSON(ALLOW_CACHE = true) {

            if (ALLOW_CACHE) {

                let resource = URL.RC.get(this.path);

                if (resource)
                    return new Promise((res) => {
                        res(resource);
                    });
            }

            return fetchLocalJSON(this).then(res => (URL.RC.set(this.path, res), res));
        }

        /**
         * Cache a local resource at the value 
         * @param    {object}  resource  The resource to store at this URL path value.
         * @returns {boolean} `true` if a resource was already cached for this URL, false otherwise.
         */
        cacheResource(resource) {

            let occupied = URL.RC.has(this.path);

            URL.RC.set(this.path, resource);

            return occupied;
        }

        submitForm(form_data) {
            return submitForm(this, form_data);
        }

        submitJSON(json_data, mode) {
            return submitJSON(this, json_data, mode);
        }
        /**
         * Goes to the current URL.
         */
        goto() {
            return;
        }
        //Returns the last segment of the path
        get file() {
            return this.path.split("/").pop();
        }
        //returns the name of the file less the extension
        get filename() {
            return this.file.split(".").shift();
        }

        //Returns the all but the last segment of the path
        get dir() {
            return this.path.split("/").slice(0, -1).join("/") || "/";
        }

        get pathname() {
            return this.path;
        }

        get href() {
            return this.toString();
        }

        get ext() {
            const m = this.path.match(/\.([^\.]*)$/);
            return m ? m[1] : "";
        }

        get search() {
            return this.query;
        }
    }

    /**
     * The fetched resource cache.
     */
    URL.RC = new Map();

    /**
     * The Default Global URL object. 
     */
    URL.G = (typeof location != "undefined") ? new URL(location) : null;

    /**
     * The Global object Proxy.
     */
    URL.R = {
        get protocol() {
            return URL.G.protocol;
        },
        set protocol(v) {
            return;
        },
        get user() {
            return URL.G.user;
        },
        set user(v) {
            return;
        },
        get pwd() {
            return URL.G.pwd;
        },
        set pwd(v) {
            return;
        },
        get host() {
            return URL.G.host;
        },
        set host(v) {
            return;
        },
        get port() {
            return URL.G.port;
        },
        set port(v) {
            return;
        },
        get path() {
            return URL.G.path;
        },
        set path(v) {
            return;
        },
        get query() {
            return URL.G.query;
        },
        set query(v) {
            return;
        },
        get hash() {
            return URL.G.hash;
        },
        set hash(v) {
            return;
        },
        get map() {
            return URL.G.map;
        },
        set map(v) {
            return;
        },
        setPath(path) {
            return URL.G.setPath(path);
        },
        setLocation() {
            return URL.G.setLocation();
        },
        toString() {
            return URL.G.toString();
        },
        getData(class_name = "") {
            return URL.G.getData(class_name = "");
        },
        setData(class_name = "", data = null) {
            return URL.G.setData(class_name, data);
        },
        fetchText(ALLOW_CACHE = true) {
            return URL.G.fetchText(ALLOW_CACHE);
        },
        cacheResource(resource) {
            return URL.G.cacheResource(resource);
        }
    };



    let SIMDATA = null;

    /* Replaces the fetch actions with functions that simulate network fetches. Resources are added by the user to a Map object. */
    URL.simulate = function() {
        SIMDATA = new Map;
        URL.prototype.fetchText = async d => ((d = this.toString()), SIMDATA.get(d)) ? SIMDATA.get(d) : "";
        URL.prototype.fetchJSON = async d => ((d = this.toString()), SIMDATA.get(d)) ? JSON.parse(SIMDATA.get(d).toString()) : {};
    };

    //Allows simulated resources to be added as a key value pair, were the key is a URI string and the value is string data.
    URL.addResource = (n, v) => (n && v && (SIMDATA || (SIMDATA = new Map())) && SIMDATA.set(n.toString(), v.toString));

    URL.polyfill = async function() {

        if (typeof(global) !== "undefined") {
            const
                fs = (await import('fs')).promises,
                path = (await import('path')),
                http = (await import('http'));


            global.document = global.document || {};
            global.document.location = URL.G;
            global.location = (class extends URL {});
            URL.G = new URL(process.cwd() + "/");

            const cached = URL.resolveRelative;

            URL.resolveRelative = function(new_url, old_url){
                
                let URL_old = (old_url instanceof URL) ? old_url : new URL(old_url);
                let URL_new = (new_url instanceof URL) ? new_url : new URL(new_url);

                if(URL_new.path[0] == "/"){
                    URL_new.path = path.join(process.cwd() , URL_new.path);
                    return URL_new;
                }else return cached(URL_new, URL_old);
            };

            /**
             * Global `fetch` polyfill - basic support
             */
            global.fetch = async (url, data) => {

                if (data.IS_CORS) { // HTTP Fetch
                    return new Promise(res => {
                        http.get(url, data, (req, error) => {

                            let body = "";

                            req.setEncoding('utf8');

                            req.on("data", d => {
                                body += d;
                            });

                            req.on("end", () => {
                                res({
                                    status: 200,
                                    text: () => {
                                        return {
                                            then: (f) => f(body)
                                        }
                                    }
                                });
                            });
                        });
                    })


                } else { //FileSystem Fetch
                    let
                        p = path.resolve(process.cwd(), "" + url),
                        d = await fs.readFile(p, "utf8");

                           
                    try {
                        return {
                            status: 200,
                            text: () => {
                                return {
                                    then: (f) => f(d)
                                }
                            }
                        };
                    } catch (err) {
                        throw err;
                    }
                }
            };
        }
    };

    Object.freeze(URL.R);
    Object.freeze(URL.RC);
    Object.seal(URL);

    /**
     * Page visualization of the data that model contains.
     *
     * @class      PageView (name)
     */
    class PageView {
        constructor(URL, app_page) {
            this.url = URL;
            this.eles = [];
            this.finalizing_view = null;
            this.type = "normal";
            this.ele = app_page;
            this.ele_backer = null;
            this.LOADED = false;
            this.style = null;
        }
        destroy() {
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                element.destroy();
            }
            this.eles = null;
            this.ele = null;
        }
        unload() {
            this.LOADED = false;
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                element.unloadComponents();
            }
            if (this.style && this.style.parentElement)
                this.style.parentElement.removeChild(this.style);
        }
        getElement(id) {
            return this.eles.find((e) => e.ele.id == id);
        }
        mount(app_element, wurl, prev_page) {
            if (this.style && !this.style.parentElement)
                document.head.appendChild(this.style);
            this.LOADED = true;
            if (app_element.firstChild)
                app_element.insertBefore(this.ele, app_element.firstChild);
            else
                app_element.appendChild(this.ele);
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                let contemporary = (prev_page && element.ele.id) ? prev_page.getElement(element.ele.id) : null;
                element.loadComponents(wurl, contemporary);
            }
        }
        finalize() {
            if (this.LOADED)
                return;
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                element.finalize();
            }
            if (this.ele.parentElement)
                this.ele.parentElement.removeChild(this.ele);
        }
        /**
         * Loads elements from HTML and JS data provided by router. Returns Promise that resolves when components are fully constructed. Allows for asynchronous network bound component construction.
         *
         * @param      {<type>}   model_constructors      The model constructors
         * @param      {<type>}   component_constructors  The component constructors
         * @param      {<type>}   presets                 The presets
         * @param      {<type>}   DOM                     The dom
         * @param      {<type>}   wurl                    The wurl
         * @return     {Promise}  { description_of_the_return_value }
         */
        load(model_constructors, component_constructors, presets, DOM, wurl) {
            return new Promise((res, rej) => {
                let unresolved_count = 1;
                const resolution = () => {
                    unresolved_count--;
                    if (unresolved_count == 0)
                        res(this);
                };
                const unresolved = (count = 1) => unresolved_count += count;
                for (var i = 0; i < this.eles.length; i++) {
                    let element = this.eles[i];
                    element.page = this;
                    element.setComponents(model_constructors, component_constructors, presets, DOM, wurl, unresolved, resolution);
                }
                resolution();
            });
        }
        up(data, src) {
            for (var i = 0; i < this.eles.length; i++)
                this.eles[i].down(data, src);
        }
        transitionOut(transitioneer) {
            for (var i = 0; i < this.eles.length; i++)
                this.eles[i].transitionOut(transitioneer);
        }
        transitionIn(transitioneer) {
            /*
            transitioneer({
                obj: this.ele,
                prop: "style.opacity",
                key: [0, 1],
                duration: 50,
                delay: 0
            });

            if (this.type == "modal") {
                setTimeout(() => {
                    this.ele.style.opacity = 1;
                }, 50);
            }
            */
            for (var i = 0; i < this.eles.length; i++) {
                let element = this.eles[i];
                element.parent = this;
                element.transitionIn(transitioneer);
            }
        }
        compareComponents() {
            //This will transition objects
        }
        setType(type, router) {
            this.type = type || "normal";
            if (type == "modal") {
                if (!this.ele_backer) {
                    this.ele_backer = document.createElement("div");
                    this.ele_backer.classList.add("modal_backer");
                    this.ele.insertBefore(this.ele_backer, this.ele.firstChild);
                    this.ele_backer.addEventListener("click", (e) => {
                        if (e.target == this.ele_backer) {
                            router.closeModal();
                        }
                    });
                }
            }
        }
    }

    /**
     * The base class for all components
     * @param      {HTMLElement}  element  The DOM `<component>` element that the Component can append sub elements to. It may be replaced by a different type of element if necessary, is in the case with an ErrorComponent.
     * @memberof module:wick~internals.component
     * @alias BaseComponent
     */
    class BaseComponent {
        constructor(element) {
            /**
             * The HTML element the component will append elements to.
             */
            this.ele = element;
            /**
             * Set to `true` if the component's `ele` element is currently appended to the main document.
             */
            this.LOADED = false;
        }
        /**
         * Returns a list of all elements that have a name attribute.
         * @param      {Object}  named_elements  Object to _bind_ named elements to.
         */
        getNamedElements(named_elements) { }
        /**
         * Called by the hosting Element when it is mounted to the active page.
         * Allows the component to react to changes observed in the URL of the website.
         */
        handleUrlUpdate() { }
        /**
         * Called by the hosting Element when it is mounted to the active page.
         * Allows the component to apply a transition in effect.
         */
        transitionIn() { }
        /**
         * Called by the hosting Element before it is unmounted from the active page.
         * Allows the component to apply a transition out effect.
         * @override
         */
        transitionOut() { }
        finalizeMount(parent) {
            if (this.LOADED == false && this.ele.parentElement)
                this.ele.parentElement.removeChild(this.ele);
        }
        pendMount(obj, wrap_index, url) {
            this.LOADED = true;
            this.parent = obj;
            this.parent.wraps[wrap_index].appendChild(this.ele);
            this.handleUrlUpdate(url);
        }
    }
    /**
     * Component attaches an error message to the `<component>`.  It allows JS errors to show in client space.
     * @param      {HTMLElement}  element        Ignored by this class
     * @param      {(string | Error)}  error_message  The error message or object to display.
     * @param      {Presets}  presets        The global Presets object.
     * @alias FailedComponent
     * @memberof module:wick~internals.component
     * @extends BaseComponent
     */
    class FailedComponent extends BaseComponent {
        constructor(element, error_message, presets) {
            super(document.createElement("div"));
            this.ele.innerHTML = `<h3> This Wick component has failed!</h3> <h4>Error Message:</h4><p>${error_message.stack}</p><p>Please contact the website maintainers to address the problem.</p> <p>${presets.error_contact}</p>`;
        }
    }
    /**
     * Builds out a `<component>` trough the Wick templating system.
     * @param      {HTMLElement}  element                 The element
     * @param      {Presets}  presets                 The global Presets object
     * @param      {Object}  app_components          The application components
     * @param      {Object}  component_constructors  The component constructors
     * @param      {Object}  model_constructors      The model constructors
     * @param      {HTMLElement}  WORKING_DOM             The working dom
     * @memberof module:wick~internals.component
     * @alias Component
     * @return     {Component}  If this object is already cached in app_components, returns the existing cached object.
     * @extends BaseComponent
     */
    class Component extends BaseComponent {
        constructor(element, presets, DOM, component_constructor, resolve_pending, wick_ele) {
            super(element);
            this.element = wick_ele;
            this.public = "";
            this.presets = presets;
            /**
             * The {@link Model} the
             */
            this.model = null;
            /**
             * All {@link Source}s bound to this component from a {@link SourcePackag}.
             */
            this.sources = [];
            /**
             *  Set to true by Element when the Element mounts the component to the document.
             */
            this.ACTIVE = false;
            this._resolve_pending_ = resolve_pending;
            const id = element.classList[0];
            this.comp = new component_constructor(null, element);
            this.resolve();
        }
        resolve() {
            if (this._resolve_pending_)
                this._resolve_pending_();
            this._resolve_pending_ = null;
        }
        /**
         * @override
         */
        transitionOut(transitioneer) {
            for (let i = 0, l = this.sources.length; i < l; i++)
                this.sources[i].transitionOut({ trs_out: transitioneer });
            if (!this.LOADED || !this.ACTIVE) {
                this.ACTIVE = false;
                return 0;
            }
            this.ACTIVE = false;
            let t = 0;
            return t;
        }
        /**
         * @override
         */
        transitionIn(transitioneer) {
            for (let i = 0, l = this.sources.length; i < l; i++)
                this.sources[i].transitionIn({ trs_in: transitioneer });
            if (!this.LOADED || this.ACTIVE) {
                this.ACTIVE = true;
                return 0;
            }
            this.ACTIVE = true;
        }
        sourceLoaded() {
            if (this.sources.length > 0) {
                let ele = this.sources[0].ele;
                let statics = this.sources[0].statics;
                //Load temporary public model data;
                if (statics && statics.public)
                    this.presets.models[statics.public] = this.sources[0].model;
                if (ele !== this.ele) {
                    if (this.ele.parentElement) {
                        this.ele.parentElement.insertBefore(ele, this.ele);
                        this.ele.parentElement.removeChild(this.ele);
                    }
                    this.ele = ele;
                }
            }
            this._resolve_pending_();
            this._resolve_pending_ = null;
            this.handleUrlUpdate();
        }
        /**
         * @override
         */
        handleUrlUpdate(url = new URL("", true)) {
            let query_data = url.getData();
            for (let i = 0, l = this.sources.length; i < l; i++)
                this.sources[i].update(query_data, null, true);
            if (this.url_store) {
                let url = this.url_store;
                this.url_store = null;
                this.handleUrlUpdate(url);
            }
            if (this.sources.length == 0)
                this.url_store = url;
        }
        _upImport_(prop_name, data, meta, src) {
            let d = {};
            d[prop_name] = data;
            this.element.up(d, src);
        }
        down(data, src) {
            for (let i = 0, l = this.sources.length; i < l; i++)
                if (src !== this.sources[i])
                    this.sources[i].down(data);
        }
        pendMount(obj, wrap_index, url) {
            super.pendMount(obj, wrap_index, url);
            for (let i = 0, l = this.sources.length; i < l; i++)
                this.sources[i].update({ mounted: true });
        }
    }

    /**
     * Class for element.
     *
     * @class      Element (name)
     *
     * Elements are the root scope for a set of components.
     * If two pages share the same element name, then the will remain mounted on the page as it transitions to the next.
     * Elements are used to determine how one page transitions into another.
     */
    class Element {
        /**
         * Constructs an Element.
         *
         * @param      {HTMLElement}  element  The HTMLElement that this Element will be bound to.
         */
        constructor(element, page) {
            this.id = (element.classList) ? element.classList[0] : element.id;
            this.components = [];
            this.bubbled_elements = null;
            this.wraps = [];
            this.page = page;
            //The original element container.
            //this.parent_element = parent_element;
            //Content that is wrapped in an ele_wrap
            this.ele = element;
            if (element.dataset.unique)
                this.unique = !!element.dataset.unique;
            else
                this.unique = false;
        }
        up(data, src) {
            this.page.up(data, src);
        }
        down(data, src) {
            for (var i = 0; i < this.components.length; i++)
                this.components[i].down(data, src);
        }
        finalize() {
            for (var i = 0; i < this.components.length; i++)
                this.components[i].finalizeMount(this);
        }
        unloadComponents() {
            for (var i = 0; i < this.components.length; i++)
                this.components[i].LOADED = false;
        }
        loadComponents(url, contemporary) {
            for (let i = 0; i < this.components.length; i++)
                this.components[i].pendMount(this, i, url);
            let before = this.ele.firstChild;
            if (contemporary) {
                for (let i = 0; i < contemporary.components.length; i++) {
                    let component = contemporary.components[i];
                    if (component.LOADED)
                        before = component.ele.parentElement;
                    else
                        this.ele.insertBefore(component.ele, (before) ? before.nextSibling : null);
                }
            }
        }
        transitionOut(transitioneer) {
            for (var i = 0; i < this.components.length; i++) {
                let component = this.components[i];
                if (!component.LOADED) {
                    component.transitionOut(transitioneer);
                }
            }
        }
        transitionIn(transitioneer) {
            // This is to force a document repaint, which should cause all elements to report correct positioning hereafter
            let t = this.ele.style.top;
            this.ele.style.top = t;
            for (let i = 0; i < this.components.length; i++) {
                let component = this.components[i];
                component.transitionIn(transitioneer);
            }
        }
        bubbleLink(link_url, child, trs_ele = {}) {
            this.bubbled_elements = trs_ele;
            history.pushState({}, "ignored title", link_url);
            window.onpopstate();
        }
        setComponents(Model_Constructors, Component_Constructors, presets, DOM, url, add_pending, res_pending) {
            //if there is a component inside the element, register that component if it has not already been registered
            var components = Array.prototype.map.call(this.ele.querySelectorAll(`[w-component]`), (a) => a);
            if (components.length < 1) {
                //Create a wrapped component for the elements inside the <element>
                let component = document.createElement("div");
                component.classList.add("comp_wrap");
                //Straight up string copy of the element's DOM.
                component.innerHTML = this.ele.innerHTML;
            }
            for (var i = 0; i < components.length; i++) {
                let app_component = null, component = components[i];
                add_pending(1);
                try {
                    /**
                        Replace the component with a component wrapper to help preserve DOM arrangement
                    */
                    //*
                    let comp_wrap = document.createElement("div");
                    comp_wrap.classList.add("comp_wrap");
                    this.wraps.push(comp_wrap);
                    component.parentElement.replaceChild(comp_wrap, component);
                    //*/
                    var id = component.getAttribute("w-component");
                    /**
                      We must ensure that components act as template "landing spots". In order for that to happen we must check for:
                      (1) The component has, as it's first class name, an id that (2) matches the id of a template. If either of these prove to be not true, we should reject the adoption of the component as a Wick
                      component and instead treat it as a normal "pass through" element.
                    */
                    let component_constructor = presets.component_class.get(id);
                    app_component = new Component(component, presets, DOM, component_constructor, res_pending, this);
                }
                catch (error) {
                    app_component = new FailedComponent(component, error, presets);
                    res_pending();
                }
                if (!app_component) {
                    app_component = new FailedComponent(component, new Error("Could not create new component, no suitable build data found."), presets);
                    res_pending();
                }
                this.components.push(app_component);
            }
        }
    }

    /** @namespace Router */
    /**
     * Returns the `<modal>` element from the document DOM, or creates and appends a new one to `<body>`.
     */
    function getModalContainer() {
        let modal_container = document.getElementsByTagName("modals")[0];
        if (!modal_container) {
            modal_container = document.createElement("modals");
            var dom_app = document.getElementById("app");
            if (dom_app)
                dom_app.appendChild(modal_container, dom_app);
            else
                document.body.appendChild(modal_container);
            modal_container.addEventListener("click", (e) => {
                if (e.target == modal_container) {
                    wick.router.closeModal();
                }
            });
        }
        return modal_container;
    }
    /**
     * Responsible for loading pages dynamically, handling the transition of page components, and monitoring and reacting to URL changes
     *
     * @memberof   module:wick~internal
     * @param      {Presets}  presets  A {@link Presets} object.
     * @package
     * @alias Router
     */
    class Router {
        /**
         * Constructs the object.
         */
        constructor(presets) {
            this.pages = {};
            this.elements = {};
            this.component_constructors = presets.custom_sources;
            this.models_constructors = presets.schemas;
            this.frozen_presets = presets;
            this.active_presets = presets;
            this.current_url = null;
            this.current_query = null;
            this.current_view = null;
            this.finalizing_pages = [];
            this.prev = null;
            presets.processLink = (temp, source) => {
                if (!temp.onclick)
                    temp.onclick = (e) => {
                        let link = e.currentTarget;
                        if (link.origin !== location.origin)
                            return;
                        //source.bubbleLink();
                        e.preventDefault();
                        //TODO: allow preloading of pages and modals
                        history.pushState({}, "ignored title", link.href);
                        window.onpopstate();
                    };
            };
            //Adding CandleFW URL to the presets object for use by wick components. 
            presets.url = URL;
            /* */
            this.modal_stack = [];
            window.onpopstate = (e = {}) => {
                if (this.IGNORE_NAVIGATION) {
                    this.IGNORE_NAVIGATION = false;
                    return;
                }
                if (e.state && e.state.modal_state) {
                    this.parseURL(e.state.modal_url);
                }
                else {
                    this.parseURL(document.location);
                }
            };
        }
        finalizePages(pages = this.finalizing_pages) {
            for (var i = 0, l = pages.length; i < l; i++) {
                var page = pages[i];
                page.finalize();
            }
            this.finalizing_pages.length = 0;
        }
        /**
         * Loads pages from server, or from local cache, and sends it to the page parser.
         * @param {String} url - The URL id of the cached page to load.
         * @param {String} query -
         * @param {Bool} IS_SAME_PAGE -
         */
        loadPage(page, wurl = new URL(document.location.href), IS_SAME_PAGE = false) {
            let transition = cfw.glow.createTransition();
            let app_ele = document.getElementById("app");
            let transition_elements = {};
            let finalizing_pages = [];
            let current_view = this.current_view;
            if (page.type == "modal" || page.type == "transitioning_modal") {
                page.CLOSE = false;
                //Replace the URL with the previous calling URL to prevent subsequent attempts of navigation to the modal resource.
                let u = new URL(this.prev_url.toString());
                u.hash = `rm${wurl.pathname.split("/").pop()}`;
                history.replaceState({ modal_state: true, modal_url: wurl.toString() }, "ignored title", u.toString());
                //trace modal stack and see if the modal already exists
                if (IS_SAME_PAGE)
                    return;
                let FORCE_CLOSE = (page.type == "transitioning_modal");
                this.modal_stack = this.modal_stack.reduce((r, a) => {
                    if ((!(FORCE_CLOSE || a.CLOSE))) {
                        r.push(a);
                    }
                    else if (a !== page) {
                        a.unload();
                        finalizing_pages.push(a);
                        a.transitionOut(transition.out);
                    }
                    return r;
                }, []);
                //*/
                //this.modal_stack.length = UNWIND;
                this.modal_stack.push(page);
                if (page.type != "transitioning_modal") {
                    page.mount(getModalContainer(), wurl);
                    page.transitionIn(transition.in);
                    transition.start().then(() => { this.finalizePages(finalizing_pages); });
                    return;
                }
                this.current_view = null;
            }
            else {
                this.prev_url = wurl;
                this.current_view = page;
                this.current_url = wurl.toString();
                for (var i = 0, l = this.modal_stack.length; i < l; i++) {
                    let modal = this.modal_stack[i];
                    modal.unload();
                    modal.transitionOut(transition.out);
                    finalizing_pages.push(modal);
                }
                this.modal_stack.length = 0;
            }
            if (current_view && current_view != page) {
                current_view.unload(transition_elements);
                page.mount(app_ele, wurl, current_view);
                current_view.transitionOut(transition.out);
                finalizing_pages.push(current_view);
                page.transitionIn(transition.in);
            }
            else if (!current_view) {
                page.mount(app_ele, wurl);
                page.transitionIn(transition.in);
            }
            transition.asyncPlay().then(() => { this.finalizePages(finalizing_pages); });
        }
        closeModal(data = {}) {
            let top = this.modal_stack.length - 1;
            let modal = this.modal_stack[top];
            modal.CLOSE = true;
            if (modal.reply)
                modal.reply(data);
            modal.reply = null;
            let next_modal = this.modal_stack[top - 1];
            if (next_modal)
                return this.loadPage(next_modal);
            return this.parseURL(this.prev_url.toString(), this.prev_url);
        }
        loadModal(url_, query_data) {
            return new Promise((res) => {
                history.pushState({}, "ignored title", url_);
                let url = new URL(url_);
                url.setData(query_data);
                this.parseURL(url, url, res);
            });
        }
        /*
            This function will parse a URL and determine what Page needs to be loaded into the current view.
        */
        parseURL(location, wurl = new URL(location), pending_modal_reply = null) {
            let url = wurl.toString();
            //if (wurl.pathname)
            //  url = wurl.pathname;
            let IS_SAME_PAGE = (this.current_url == url), page = null;
            if ((page = this.pages[wurl.path])) {
                page.reply = pending_modal_reply;
                if (IS_SAME_PAGE && this.current_view == page) {
                    console.log("missing same-page resolution");
                    return;
                }
                this.loadPage(page, wurl, IS_SAME_PAGE);
                return;
            }
            if (location)
                wurl.fetchText().then(html => {
                    var DOM = (new DOMParser()).parseFromString(html, "text/html");
                    this.loadNewPage(wurl, DOM, pending_modal_reply).then(page => this.loadPage(page, wurl, IS_SAME_PAGE));
                }).catch((error) => {
                    console.warn(`Unable to process response for request made to: ${this.url}. Response: ${error}. Error Received: ${error}`);
                });
        }
        /**
            Pre-loads a custom constructor for an element with the specified id and provides a model to that constructor when it is called.
            The constructor must have Element in its inheritance chain.
        */
        addStatic(element_id, constructor, model) {
            this.component_constructors[element_id] = {
                constructor,
                model_name: model
            };
        }
        /**
            Creates a new iframe object that acts as a modal that will sit ontop of everything else.
        */
        loadNonWickPage(URL) {
            let url = URL.toString();
            let iframe = document.createElement("iframe");
            iframe.src = URL;
            iframe.classList.add("modal", "comp_wrap");
            var page = new PageView(URL, iframe);
            page.type = "modal";
            this.pages[URL] = page; //new Modal(page, iframe, getModalContainer());
            return this.pages[URL];
        }
        /**
            Takes the DOM of another page and strips it, looking for elements to use to integrate into the SPA system.
            If it is unable to find these elements, then it will pass the DOM to loadNonWickPage to handle wrapping the page body into a wick app element.
        */
        loadNewPage(url = new URL("", true), DOM, pending_modal_reply = null) {
            //look for the app section.
            /**
                If the page should not be reused, as in cases where the server does all the rendering for a dynamic page and we're just presenting the results,
                then having NO_BUFFER set to true will cause the linker to not save the page to the hashtable of existing pages, forcing a request to the server every time the page is visited.
            */
            let NO_BUFFER = false;
            /*
                App elements: There should only be one.
            */
            let app_source = DOM.getElementById("app");
            /**
              If there is no <app> element within the DOM, then we must handle this case carefully. This likely indicates a page delivered from the same origin that has not been converted to work with the Wick system.
              The entire contents of the page can be wrapped into a <iframe>, that will be could set as a modal on top of existing pages.
            */
            if (!app_source) {
                console.warn("Page does not have an <app> element!");
                return this.loadNonWickPage(url);
            }
            var app_page = document.createElement("apppage");
            app_page.innerHTML = app_source.innerHTML;
            var app = app_source.cloneNode(true);
            var dom_app = document.getElementById("app");
            var page = new PageView(url, app_page);
            if (document == DOM)
                dom_app.innerHTML = "";
            else {
                //collect the templates and add to root dom. 
                const wick_script = DOM.getElementById("wick-components");
                if (wick_script)
                    (Function("cfw", "wick", wick_script.innerHTML))(cfw, { default: cfw.wick });
                const wick_style = DOM.getElementById("wick-css");
                if (wick_style) {
                    page.style = wick_style.cloneNode(true);
                }
            }
            if (app_source) {
                if (app_source.dataset.modal == "true" || pending_modal_reply) {
                    page.setType("modal", this);
                    let modal = document.createElement("modal");
                    modal.innerHTML = app.innerHTML;
                    app.innerHTML = "";
                    app = modal;
                    page.reply = pending_modal_reply;
                    /*
                        If the DOM is the same element as the actual document, then we shall rebuild the existing <app> element, clearing it of it's contents.
                    */
                    if (DOM == document && dom_app) {
                        let new_app = document.createElement("app");
                        document.body.replaceChild(new_app, dom_app);
                        dom_app = new_app;
                    }
                }
                else if (app_source.dataset.modal == "transition") {
                    page.setType("transitioning_modal", this);
                }
                if (app.dataset.no_buffer == "true")
                    NO_BUFFER = true;
                var elements = app_page.getElementsByTagName("element");
                for (var i = 0; i < elements.length; i++) {
                    let ele = elements[i], element;
                    let element_id = ele.id;
                    if (page.type !== "modal") {
                        element = new Element(ele);
                    }
                    else {
                        let new_ele = document.createElement("div");
                        new_ele.innerHTML = ele.innerHTML;
                        new_ele.classList.add("ele_wrap");
                        element = new Element(ele);
                    }
                    page.eles.push(element);
                    if (!this.elements[element_id])
                        this.elements[element_id] = {};
                    element.common_components = this.elements[element_id];
                }
                let promise = page.load(this.models_constructors, this.component_constructors, this.active_presets, DOM, url);
                if (!NO_BUFFER)
                    this.pages[url.path] = page;
                return promise;
            }
        }
    }
    let LINKER_LOADED = false;
    function radiate() {
        if (LINKER_LOADED)
            return;
        LINKER_LOADED = true;
        window.addEventListener("load", () => {
            const router = new Router(cfw.wick.rt.presets);
            router
                .loadNewPage(new URL(document.location), document, false)
                .then(page => router.loadPage(page, new URL(location.href), true));
        });
    }
    addModuleToCFW(radiate, "radiate");

    exports.Component = Component;
    exports.Element = Element;
    exports.PageView = PageView;
    exports.Router = Router;
    exports.default = radiate;

    return exports;

}({}));
