using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class CategoryService
    {
        private readonly AppDbContext _context;

        public CategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<EventCategory>> GetAllCategoriesAsync() => await _context.EventCategories.ToListAsync();

        public async Task<EventCategory> CreateCategoryAsync(CreateCategoryDto dto)
        {
            var category = new EventCategory { Name = dto.Name, Description = dto.Description };
            _context.EventCategories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task UpdateCategoryAsync(int id, CreateCategoryDto dto)
        {
            var category = await _context.EventCategories.FindAsync(id);
            if (category == null) throw new Exception("Category not found.");

            category.Name = dto.Name;
            category.Description = dto.Description;
            await _context.SaveChangesAsync();
        }

        // BRD Rule: A category cannot be deleted if it is currently assigned to one or more existing events.
        public async Task DeleteCategoryAsync(int id)
        {
            var category = await _context.EventCategories.FindAsync(id);
            if (category == null) throw new Exception("Category not found.");

            var isAssignedToEvents = await _context.Events.AnyAsync(e => e.CategoryId == id);
            if (isAssignedToEvents) throw new Exception("Cannot delete a category that is currently assigned to existing events.");

            _context.EventCategories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
}