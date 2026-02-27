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
    custom_font = pygame.font.Font("ByteBounce.ttf", 40)
except pygame.error:
    print("Custom font not found, usindsg default font.")
    custom_font = pygame.font.Font(None, 40)

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Fill the screen with a background color
    screen.fill(BLACK)

    # 2. Render the text
    text_surface = custom_font.render("The Gold Rush Game!", True, GOLD)
    text_surface2 = custom_font.render("Presented by HailtheKing, pretha809,betgyf,and astroawe!", True, GOLD)

    # 3. Get the text rectangle for positioning (optional, but useful for centering)
    text_rect = text_surface.get_rect(center=(screen_width // 2, screen_height // 2))
    text_rect2 = text_surface2.get_rect(center=(screen_width // 2, screen_height // 2 + 30))

    # 4. Blit the text surface to the screen
    screen.blit(text_surface, text_rect)
    screen.blit(text_surface2, text_rect2)

    # Update the display
    pygame.display.flip()

# Quit pygame
pygame.quit()
