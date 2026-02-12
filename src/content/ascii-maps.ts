// UK dotted map - braille-encoded from Vecteezy UK map image
// Each braille character packs a 2×4 dot grid into a single terminal cell
// Manchester cluster is colored at render time using position data
export const ukMap = `                      ⢰⠶
                  ⣄ ⡀⣠⣈
            ⢠⣴⠃  ⢸⣿⣿⣿⣿⠟
            ⠨⠌  ⣤⣽⣿⣿⣿⡋
           ⡟ ⢴⡇ ⣿⣿⣿⣿⣯⣴⣾⣿⣿⣿⡿⠆
          ⠠⠁ ⢠⡋⠃⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃
             ⠄⡐⠾⠿⣿⣿⣿⣿⣿⣿⣿⣿⠛
            ⠉ ⠜⠃⢠⣿⣿⣿⣿⣿⣿⣥⡦
             ⢠⣴⠎⢹⢛⢹⣿⣿⣿⣴⣤⣶⣦⣄
          ⢀  ⠈⠃⣠⠟⡦⢘⣻⣿⣿⣿⣿⣿⣿⣿⣷⡄
       ⢰⣶⣾⣿⣧⣴⣶⡄⠈⠁⢀⣾⣿⣿⣿⠿⣿⣿⣿⣿⣿⣇
      ⠐⠞⣿⣿⣿⣿⣿⣿⣿⣧ ⠘⠙⠋⠈⠋⣠⣾⣿⣿⣿⣿⣿⡆⢀
  ⢦⣦⣦⣄⣴⣾⣿⣿⣿⣿⣿⣿⣿⠧⡀  ⡀  ⠻⣿⣿⣿⣿⣿⣿⣿⣿⣷⣀
  ⢙⣹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⠋   ⠘     ⣸⣿⣿⣿⣿⣿⣿⣿⣿⡄
  ⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠄     ⡀   ⠿⣿⣿⣿⣿⣿⣿⣿⣿⣧
   ⢠⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄    ⠉⣃⣴⣶⣾⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟ ⡀
  ⢠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃   ⠐⠛⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣼⣿⣿⣷⣆
⠴⠤⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢿⡋      ⢀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏
⠚⢷⡿⣿⣿⣿⡟⠿⠛⠁       ⣠⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⡏⠁
⠈⠁⠐⠙⠙⠋           ⠘⠛⠉⠻⠿⢿⣿⡿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠓⢀⡀
                    ⢀⣴⣤⣀⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃
                   ⣹⣾⣿⣿⣿⡿⠿⣿⣿⡿⠿⠛⠛⠟⠛⠋⠻⠋⠁
                ⢀⣰⡿⣿⠿⢿⡏⠁    ⠁
               ⠚⠙⠏`;

// Manchester positions — 2 adjacent braille chars = 4×4 dot square (visually square)
// Each braille char is 2 dots wide × 4 dots tall; 2 chars = 4×4 dots
export const manchesterPositions: [number, number][] = [
  [14, 26],
  [14, 27],
];
