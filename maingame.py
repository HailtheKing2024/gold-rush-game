import pygame

# Initialize pygame
pygame.init()
pygame.font.init()

# Set up display
infoObject = pygame.display.Info()
screen_width = infoObject.current_w
screen_height = infoObject.current_h
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
    print("Custom font not found, using default font.")
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

    # 3. Get the text rectangle for positioning (optional, but useful for centering)
    text_rect = text_surface.get_rect(center=(screen_width // 2, screen_height // 2))

    # 4. Blit the text surface to the screen
    screen.blit(text_surface, text_rect)

    # Update the display
    pygame.display.flip()

# Quit pygame
pygame.quit()
