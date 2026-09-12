using EventParking.API.Data;
using EventParking.API.Interfaces;
using EventParking.API.Repositories;
using EventParking.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));



// 2. Register Repositories & Services (Dependency Injection)
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<EventService>();
builder.Services.AddScoped<SeatService>();
builder.Services.AddScoped<VenueService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<ParkingService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddHostedService<EventParking.API.Workers.BookingExpirationWorker>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<NotificationService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// 3. Configure CORS (Allows your Vanilla JS frontend to talk to this API)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 4. Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            RoleClaimType = ClaimTypes.Role // Ensures it reads the role claim correctly
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "EventParking.API", Version = "v1" });

    // 1. Define the Security Scheme (The Padlock)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1Ni...\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey, // Use ApiKey so we can type "Bearer {token}"
        Scheme = "Bearer"
    });

    // 2. Apply it to all endpoints
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend"); // Must be before Auth
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();