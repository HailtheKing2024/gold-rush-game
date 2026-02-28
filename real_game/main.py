import pygame

# Initialize pygame
pygame.init()
pygame.font.init()

# Set up display
infoObject = pygame.display.Info()
screen_width = (infoObject.current_w) * 0.9
screen_height = (infoObject.current_h)* 0.9
screen = pygame.display.set_mode((screen_width, screen_height))
pygame.display.set_caption("The Gold Rush Game")

# Colors
WHITE = (255, 255, 255)
GOLD = (255,215,0)
BLACK = (0, 0, 0)

# 1. Load the custom font 
try:
    main_font = pygame.font.Font("ByteBounce.ttf", 40)
    title_font = pygame.font.Font("ByteBounce.ttf", 150)
except pygame.error:
    print("Main font not found, using default font.")
    main_font = pygame.font.Font(None, 40)

# prepare a "New save" button using the custom font
button_surf = main_font.render("New save", True, GOLD)
button_rect = button_surf.get_rect(center=(screen_width // 2,
                                           screen_height // 2 + 150))

# scrolling banner text at bottom
banner_text = "BETA VERSION 0.1.0  EXPECT BUGS!"
# render once; we'll blit it repeatedly as it scrolls
banner_surf = main_font.render(banner_text, True, GOLD)
# starting X position (off the right edge)
banner_x = screen_width
banner_y = screen_height - banner_surf.get_height() - 10  # 10px margin
banner_speed = 0.1  # pixels per frame

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
            if button_rect.collidepoint(event.pos):
                # the user clicked the "New save" button
                print("New save clicked – create a new save here")
                # TODO: call your save‑creation function

    # Fill the screen with a background color
    screen.fill(BLACK)

    # 2. Render the text
    text_surface = title_font.render("The Gold Rush Game!", True, GOLD)
    text_surface2 = main_font.render("Presented by HailtheKing, pretha809,betgyf,and astroawe!", True, GOLD)
    text_surface3 = main_font.render("A fan made game based on The Oregon Trail", True, GOLD)

    # 3. Get the text rectangle for positioning (optional, but useful for centering)
    text_rect = text_surface.get_rect(center=(screen_width // 2, screen_height // 2 - 50))
    text_rect2 = text_surface2.get_rect(center=(screen_width // 2, screen_height // 2 + 20))
    text_rect3 = text_surface3.get_rect(center=(screen_width // 2, screen_height // 2 + 50))

    # 4. Blit the text surface to the screen
    screen.blit(text_surface, text_rect)
    screen.blit(text_surface2, text_rect2)
    screen.blit(text_surface3, text_rect3)

    # draw the button (background + text)
    bg_rect = button_rect.inflate(20, 10)
    pygame.draw.rect(screen, WHITE, bg_rect)
    pygame.draw.rect(screen, GOLD, bg_rect, 2)
    screen.blit(button_surf, button_rect)

    # update banner position and draw it
    banner_x -= banner_speed
    # if it has completely scrolled past the left edge, wrap to right
    if banner_x < -banner_surf.get_width():
        banner_x = screen_width
    screen.blit(banner_surf, (banner_x, banner_y))

    # Update the display
    pygame.display.flip()

# Quit pygame
pygame.quit()
