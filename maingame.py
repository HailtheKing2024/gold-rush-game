import pygame
pygame.init()

screen = pygame.display.set_mode((640, 480))
pygame.display.set_caption("Pygame Text Example")

# 1. & 2. Load font
my_font = pygame.font.SysFont('Arial', 30)

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # 3. Render the text (usually done inside the loop if text changes)
    text_surface = my_font.render('Displaying text!', True, (255, 255, 255))

    # Clear screen with a color (optional, e.g., black)
    screen.fill((0, 0, 0))

    # 4. Blit the text to the screen
    screen.blit(text_surface, (100, 100))

    # Update the display to make changes visible
    pygame.display.flip()

pygame.quit()
